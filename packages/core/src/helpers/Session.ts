import { mkdir, readFile, readdir, unlink, writeFile } from "fs/promises";
import t from "../i18n";
import { errorMessage, infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "./EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";
import { objectKeys, tryCatch, snakelise } from "@personal/utils";
import { resolve } from "path";
import ENVIRONMENT from "../configs/environment";
import Email from "./Email";
import type { CustomError, SessionData } from "../..";
import { type EmailRequest } from "../types/EmailContent";
import CreateError from "../utils/CreateError";
import { type CustomErrorProps } from "../types/CustomError";
import EmailTemplates from "./EmailTemplates";
import { createObjectCsvWriter } from "csv-writer";
import { parse } from "papaparse";
import { existsSync } from "fs";
import { cleanItems } from "../utils/cleanItems";
import { SESSION_ID_HEADER } from "../configs/constants";
import promiseAllSeq from "../utils/sequentialPromises";
import { type ItemMeta } from "../types/Item";

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
    error: Error | CustomError | undefined,
    { isCritical, ...props }: CustomErrorProps & { isCritical?: boolean } = {},
  ): void => {
    if (!error) return;

    const customError = CreateError(error, props);

    store.useLoggers().logError(customError, isCritical);
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

  const saveAsJson = async (
    route: string,
    customName?: string,
  ): Promise<void> => {
    const doesRouteExist = existsSync(route);

    const result = await tryCatch(async () => {
      if (!doesRouteExist) await mkdir(route, { recursive: true });

      if (doesRouteExist && ENVIRONMENT.nodeEnv === "dev") {
        const dataDir = await readdir(route);
        dataDir[0] && (await unlink(resolve(route, dataDir[0])));
      }

      const $s = store.current();

      await writeFile(
        resolve(route, `${customName}${$s._id}.json`),
        JSON.stringify(
          {
            ...$s,
            emailing: {},
          } as SessionData,
          null,
          4,
        ),
      );
    });

    infoMessage(t(result[1] ? "session.error.not_saved" : "session.saved"));
  };

  const saveItemsLocally = async (path: string) => {
    const { items } = store.current();

    if (!existsSync(path)) {
      const header = [
        ...objectKeys(items[0] as Record<string, string>),
        ...META_KEYS,
      ].flatMap((key) =>
        key === "_meta"
          ? []
          : {
              id: key.startsWith("_") ? key : snakelise(key.toString()),
              title: key.startsWith("_") ? key : snakelise(key.toString()),
            },
      );

      header.push({
        id: SESSION_ID_HEADER,
        title: SESSION_ID_HEADER,
      });

      const cleanStuff = cleanItems(items, session.store()._id);

      const sessionCsv = await createObjectCsvWriter({
        path,
        header,
      }).writeRecords(cleanStuff);

      return await writeFile(path, JSON.stringify(sessionCsv, null, 1));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = parse<Record<string, any>[]>(await readFile(path, "utf8"));

    const headers = data.shift() as string[][];

    const header = headers.map((key) => ({
      id: snakelise(key.toString()),
      title: snakelise(key.toString()),
    }));

    const parsedData = data.map((item) =>
      item.reduce(
        (allElements, element, index) => ({
          ...allElements,
          [headers[index] as unknown as string]:
            typeof element === "string" ? element : JSON.stringify(element),
        }),
        {},
      ),
    );

    const newCsv = await createObjectCsvWriter({
      path,
      header,
      // eslint-disable-next-line, @typescript-eslint/no-unsafe-assignment
    }).writeRecords([...parsedData, ...cleanItems(items, session.store()._id)]);

    try {
      await writeFile(path, JSON.stringify(newCsv, null, 1));
    } catch (e) {
      // This will always throw an error
    }
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
    storeEmailLocally = "",
  ): Promise<void | Error | object> => {
    const emailContent = EmailTemplates(store.current())[contentType]();

    if (storeEmailLocally) {
      await tryCatch(async () => {
        await mkdir(storeEmailLocally, { recursive: true });

        await writeFile(
          resolve(storeEmailLocally, `EMAIL_${store.current()._id}.json`),
          JSON.stringify(emailContent, null, 4),
          "utf8",
        );
      });
    }

    if (!emailContent.sendIfEmpty && !emailContent.text) return;

    const [result, emailError] = await sendEmail!(emailContent);

    if (emailError) {
      error(emailError, { name: t("error_index.email"), isCritical: false });
      return emailError;
    }

    if (result) infoMessage(t("email.success"));

    return result;
  };

  interface LoopOptions {
    safetyCheck?: number;
    limit?: number;
  }

  const loop = async <R>(
    callback: (index: number) => Promise<R> | R,
    { limit, safetyCheck }: LoopOptions = { safetyCheck: 2 },
  ) => {
    return await tryCatch(async () => {
      let index = -1;

      const {
        offset,
        totalItems,
        location: { page },
      } = session.store();

      /** Will be updated only if there's a safetyCheck on */
      const history = {
        totalItems: 0,
        page: offset.page,
      };

      // TODO: Can we be sure the promiseAllSeq won't stop one item before finishing?
       
      const hasReachedLimit = () =>
        (limit && index === limit) || store.hasReachedLimit();

      const result = await promiseAllSeq(() => {
        if (index === limit) return;
        if (!initialized) return;

        index += 1;

        if (
          safetyCheck &&
          index % safetyCheck &&
          history.totalItems === totalItems &&
          history.page === page
        ) {
          throw CreateError(Error(t("scraper.error.loop_stuck")), {
            name: t("error_index.session"),
          });
        } else if (safetyCheck) {
          history.totalItems = totalItems;
          history.page = page;
        }

        return callback(index);
      }, hasReachedLimit);

      return result;
    });
  };

  const useConnectors = () => ({
    saveAsJson,
    saveItemsLocally,
    notify,
  });

  const useUtils = () => ({
    loop,
    error,
    setGlobalTimeout,
    hasReachedLimit: store.hasReachedLimit,
  });

  const session = {
    init,
    end,
    store: store.current,
    hooks: {
      useLocation: store.useLocation,
      useItem: store.useItem,
      useLoggers: store.useLoggers,
      useConnectors,
      useUtils,
    },
  };

  return session;
};

export default Session;

const META_KEYS: `_${keyof ItemMeta}`[] | `_${string}`[] = [
  "_error_log",
  "_id",
  "_complete",
  "_item_number",
  "_moment",
  "_page",
  "_posted",
  "_url",
];
