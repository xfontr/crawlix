import t from "../i18n";
import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";
import EventBus, { events } from "../utils/EventBus";

let initialized = false;

const SessionStore = () => {
  const store = {
    session: {
      totalActions: 0,
      totalActionsJointLength: 0,
    } as Partial<SessionData>,
  };

  const end = () => {
    const endDate = new Date();

    store.session = {
      ...store.session,
      endDate,
      duration: store.session.startDate!.getTime() - endDate.getTime(),
    };

    initialized = false;

    EventBus.removeAllListeners();

    return current();
  };

  const current = () => ({ ...store.session });

  const init = (config: SessionConfig) => {
    if (initialized) {
      throw new Error(t("session.error.initialized"));
    }

    store.session = {
      startDate: new Date(),
      ...config,
    };

    EventBus.on(events.countAction, countAction);

    initialized = true;

    return sessionStore;
  };

  const countAction = (speed: number): void => {
    store.session.totalActions! += 1;
    store.session.totalActionsJointLength! += speed * store.session.taskLength!;
  }

  const sessionStore = {
    init,
    current,
    end,
    countAction,
  };

  return sessionStore;
};

export default SessionStore;
