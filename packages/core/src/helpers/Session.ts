import t from "../i18n";
import { infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";

const Session = (baseConfig?: SessionConfig) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  const end = (): void => {
    store.end();
    infoMessage(t("session.end"));
  };

  const init = () => {
    store.init(config);
    EventBus.on("END_SESSION", end);

    infoMessage(t("session.init"));
    return session;
  };

  const session = {
    init,
    end,
    store: store.current(),
  };

  return session;
};

export default Session;
