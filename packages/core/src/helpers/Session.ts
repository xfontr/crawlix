import t from "../i18n";
import { infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";

const Session = (baseConfig?: SessionConfig) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  const init = () => {
    store.init(config);
    infoMessage(t("session.init"));
    return session;
  };

  const end = () => {
    store.end();
    infoMessage(t("session.end"));
  };

  const session = {
    init,
    end,
  }

  return session;
};

export default Session;
