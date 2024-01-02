import { readdir, unlink, writeFile } from "fs/promises";
import t from "../i18n";
import { errorMessage, infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";
import { tryCatch } from "@personal/utils";
import { resolve } from "path";
import ENVIRONMENT from "../configs/environment";
import Email from "./Email";
import type { SessionData } from "../..";
import { type EmailRequest } from "../types/EmailContent";
import EmailTemplates from "../utils/EmailTemplates";
import CreateError from "../utils/CreateError";
import { type CustomErrorProps } from "../types/CustomError";

let initialized = false;

const Session = (baseConfig?: Partial<SessionConfig>) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();
  let sendEmail: ReturnType<typeof Email> | undefined = undefined;

  const end = (abruptEnd = false): void => {
    if (!initialized) return;

    initialized = false;

    store.end(!abruptEnd);

    EventBus.emit("SESSION:ACTIVE", false);
    EventBus.removeAllListeners("SESSION:ERROR");
    EventBus.removeAllListeners("SESSION:ACTIVE");

    infoMessage(t("session.end"));
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
  ) => {
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
  ): Promise<T | "ABRUPT_ENDING"> => {
    let storedTimeout: NodeJS.Timeout | undefined = undefined;

    const cleanUp = () => {
      clearInterval(storedTimeout);
    };

    return await Promise.race<T | "ABRUPT_ENDING">([
      new Promise(
        (resolve) =>
          (storedTimeout = setTimeout(() => {
            error(
              Error(
                t(
                  `session.error.${
                    timeout === "globalTimeout" ? "global_timeout" : "after_all"
                  }`,
                ),
              ),
              {
                name: t("error_index.session"),
                isCritical: true,
              },
            );
            resolve("ABRUPT_ENDING");
          }, store.current()[timeout])),
      ),
      callback(cleanUp),
    ]);
  };

  const saveAsJson = async (route = "../../data"): Promise<void> => {
    const dataPath = resolve(__dirname, route);

    const result = await tryCatch(async () => {
      if (ENVIRONMENT.nodeEnv === "dev") {
        const dataDir = await readdir(dataPath);
        dataDir[0] && (await unlink(resolve(dataPath, dataDir[0])));
      }

      await writeFile(
        resolve(dataPath, `${store.current()._id}.json`),
        JSON.stringify({
          ...store.current(),
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
    store: store.current,
    storeHooks: {
      updateLocation: store.updateLocation,
      nextPage: store.nextPage,
      previousPage: store.previousPage,
      postItem: store.postItem,
      logMessage: store.logMessage,
    },
    setGlobalTimeout,
    saveAsJson,
    notify,
  };

  return session;
};

export default Session;
