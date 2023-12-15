import t from "../i18n";
import { errorMessage, infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";

const Session = (baseConfig?: SessionConfig) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  const end = (): void => {
    store.end();
    EventBus.removeAllListeners();
    infoMessage(t("session.end"));
  };

  const init = () => {
    store.init(config);

    EventBus.on("SESSION:ERROR", error);

    infoMessage(t("session.init"));
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
