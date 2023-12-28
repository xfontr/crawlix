import t from "../i18n";
import { errorMessage, infoMessage, warningMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";

let initialized = false;

const Session = (baseConfig?: Partial<SessionConfig>) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  const end = (abruptEnd = false): void => {
    if (!initialized) {
      warningMessage(t("session.warning.not_initialized"));
      return;
    }

    initialized = false;

    store.end(!abruptEnd);

    EventBus.emit("SESSION:ACTIVE", false);

    EventBus.removeAllListeners();

    infoMessage(t("session.end"));
  };

  const init = () => {
    if (initialized) {
      throw new Error(t("session.error.initialized"));
    }

    store.init(config);

    EventBus.on("SESSION:ERROR", error);
    EventBus.emit("SESSION:ACTIVE", true);
    EventBus.on("SESSION:ACTIVE", (status: boolean) => {
      if (!status && initialized) end();
    });

    infoMessage(t("session.init"));

    initialized = true;

    return session;
  };

  const error = (error: Error | undefined, isCritical?: boolean) => {
    if (!error) return;

    store.logError(error, isCritical);
    errorMessage(error.message);

    if (isCritical) end(true);
  };

  /**
   *
   * @param callback The function will pass a "cleanUp" parameter to the callback, so that the timer can be ended and avoid
   * unexpected behaviours.
   * @example
   * await setGlobalTimeout((cleanUp) => {
   *  // Actions
   *  cleanUp();
   * });
   * 
   */
  const setGlobalTimeout = async <T>(
    callback: (cleanUp: () => void) => Promise<T>,
  ): Promise<T | "ABRUPT_ENDING"> => {
    let storedTimeout: NodeJS.Timeout | undefined = undefined;

    const cleanUp = () => {
      clearInterval(storedTimeout);
    }

    return await Promise.race<T | "ABRUPT_ENDING">([
      new Promise(
        (resolve) =>
          (storedTimeout = setTimeout(() => {
            resolve("ABRUPT_ENDING");
          }, store.current().globalTimeout)),
      ),
      callback(cleanUp),
    ]);
  };

  const session = {
    init,
    end,
    error,
    store: store.current,
    hooks: {
      updateLocation: store.updateLocation,
      nextPage: store.nextPage,
      previousPage: store.previousPage,
      postItem: store.postItem,
    },
    setGlobalTimeout,
  };

  return session;
};

export default Session;
