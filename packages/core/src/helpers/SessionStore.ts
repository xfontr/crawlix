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
  };

  return {
    init,
  };
};

export default SessionStore;
