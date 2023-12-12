import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";

let initialized = false;

const SessionStore = () => {
  const store = {
    session: {} as Partial<SessionData>,
  };

  const end = () => {
    store.session = {
      ...store.session,
      endDate: new Date(),
      duration:
        store.session.startDate!.getTime() - store.session.endDate!.getTime(),
    };

    initialized = false;

    return current();
  };

  const current = () => ({ ...store.session });

  const init = (config: SessionConfig) => {
    if (initialized) {
      throw new Error("session.error.initialized");
    }

    store.session = {
      startDate: new Date(),
      ...config,
    };

    initialized = true;

    return {
      init,
      current,
      end,
    };
  };

  return { init };
};

export default SessionStore;
