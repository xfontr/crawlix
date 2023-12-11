import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";

const SessionStore = () => {
  const store = {
    session: {} as SessionData,
  };

  const init = (config: SessionConfig) => {
    store.session = {
      date: new Date(),
      ...config,
    };

    return sessionStore;
  };

  const current = () => ({ ...store.session });

  const sessionStore = {
    init,
    current,
  };

  return sessionStore;
};

export default SessionStore;
