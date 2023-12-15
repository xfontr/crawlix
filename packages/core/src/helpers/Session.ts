import t from "../i18n";
import { errorMessage, infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";

let initialized = false;

const Session = (baseConfig?: SessionConfig) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  const end = (): void => {
    if (!initialized) return;

    store.end();

    EventBus.emit("SESSION:ACTIVE", false);
    EventBus.removeAllListeners();

    initialized = false;

    infoMessage(t("session.end"));
  };

  const init = () => {
    if (initialized) {
      throw new Error(t("session.error.initialized"));
    }

    store.init(config);

    EventBus.on("SESSION:ERROR", error);
    EventBus.emit("SESSION:ACTIVE", true);

    infoMessage(t("session.init"));

    initialized = true;

    return session;
  };

  const error = (error: Error | undefined, isCritical?: boolean) => {
    if (!error) return;
    if (isCritical) end();

    store.logError(error, isCritical);
    errorMessage(error.message);
  };

  const session = {
    init,
    end,
    error,
    store: store.current,
  };

  return session;
};

export default Session;
