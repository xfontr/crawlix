import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import t from "../i18n";
import { errorMessage, infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "./EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";
import { tryCatch } from "@personal/utils";
import { resolve } from "path";
import ENVIRONMENT from "../configs/environment";
import Email from "./Email";
import type { SessionData } from "../..";
import { type EmailRequest } from "../types/EmailContent";
import CreateError from "../utils/CreateError";
import { type CustomErrorProps } from "../types/CustomError";
import EmailTemplates from "./EmailTemplates";
import { existsSync } from "fs";

let initialized = false;

const Session = (baseConfig?: Partial<SessionConfig>) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  let sendEmail: ReturnType<typeof Email> | undefined = undefined;

  const end = (abruptEnd = false): SessionData | undefined => {
    if (!initialized) return;

    initialized = false;

    const finalStore = store.end(!abruptEnd);

    EventBus.emit("SESSION:ACTIVE", false);
    EventBus.removeAllListeners("SESSION:ERROR");
    EventBus.removeAllListeners("SESSION:ACTIVE");

    infoMessage(t("session.end"));
    return finalStore;
  };

  const init = () => {
    if (initialized) {
      throw new Error(t("session.error.initialized"));
    }

    store.init(config);

    sendEmail = Email(store.current().emailing);

    EventBus.on("SESSION:ERROR", error);
    EventBus.emit("SESSION:ACTIVE", true);
    EventBus.on("SESSION:ACTIVE", (status: boolean) => {
      if (!status && initialized) end();
    });

    infoMessage(t("session.init"));

    initialized = true;

    return session;
  };

  const error = (
    error: Error | undefined,
    { isCritical, ...props }: CustomErrorProps & { isCritical?: boolean } = {},
  ): void => {
    if (!error) return;

    const customError = CreateError(error, props);

    store.logError(customError, isCritical);
    errorMessage(customError.publicMessage);

    if (isCritical) end(true);
  };

  /**
   *
   * @param callback The function will pass a "cleanUp" parameter to the callback, so that the timer can be ended and avoid
   * unexpected behaviors.
   * @example
   * await setGlobalTimeout((cleanUp) => {
   *  // Actions
   *  cleanUp();
   * });
   *
   */
  const setGlobalTimeout = async <T>(
    callback: (cleanUp: () => void) => Promise<T>,
    timeout: "globalTimeout" | "afterAllTimeout" = "globalTimeout",
  ): Promise<T | symbol> => {
    let storedTimeout: NodeJS.Timeout | undefined = undefined;

    const cleanUp = () => clearInterval(storedTimeout);

    return await Promise.race<T | symbol>([
      new Promise(
        (_, reject) =>
          (storedTimeout = setTimeout(() => {
            const timeoutError = CreateError(
              Error(
                t(
                  `session.error.${
                    timeout === "globalTimeout"
                      ? "global_timeout"
                      : "after_all_timeout"
                  }`,
                ),
              ),
              { name: t("error_index.session_timeout") },
            );

            error(timeoutError, { isCritical: true });
            reject(timeoutError);
          }, store.current()[timeout])),
      ),
      callback(cleanUp),
    ]);
  };

  const saveAsJson = async (route: string): Promise<void> => {
    const doesRouteExist = existsSync(route);

    const result = await tryCatch(async () => {
      if (!doesRouteExist) await mkdir(route, { recursive: true });

      if (doesRouteExist && ENVIRONMENT.nodeEnv === "dev") {
        const dataDir = await readdir(route);
        dataDir[0] && (await unlink(resolve(route, dataDir[0])));
      }

      const $s = store.current();

      await writeFile(
        resolve(route, `${$s._id}.json`),
        JSON.stringify({
          ...$s,
          emailing: {},
        } as SessionData),
      );
    });

    infoMessage(t(result[1] ? "session.error.not_saved" : "session.saved"));
  };

  /**
   * @param contentType "FULL_SESSION": Sends the entire session data
   * @param contentType "CRITICAL_ERROR": Sends the error that broke the session, if any
   * @param contentType "ITEMS": Sends the items scraped
   * @param contentType "SUCCESS_OR_ERROR": Informs whether the session ended successfully or not.
   * Includes the breaking error, if any
   */
  const notify = async (
    contentType: EmailRequest,
  ): Promise<void | Error | object> => {
    const emailContent = EmailTemplates(store.current())[contentType]();

    if (!emailContent.sendIfEmpty && !emailContent.text) return;

    const [result, emailError] = await sendEmail!(emailContent);

    if (emailError) {
      error(emailError, { name: t("error_index.email"), isCritical: false });
      return emailError;
    }

    if (result) infoMessage(t("email.success"));

    return result;
  };

  const session = {
    init,
    end,
    error,
    /**
     * @return Current store data
     */
    store: store.current,
    storeHooks: {
      /**
       * @description Force set the current location. If the limit is reached, ends the session
       */
      updateLocation: store.updateLocation,
      /**
       * @description Updates current location to next page
       */
      nextPage: store.nextPage,
      /**
       * @description Updates current location to previous page
       */
      previousPage: store.previousPage,
      postItem: store.postItem,
      logMessage: store.logMessage,
      hasReachedLimit: store.hasReachedLimit,
    },
    setGlobalTimeout,
    saveAsJson,
    notify,
  };

  return session;
};

export default Session;
