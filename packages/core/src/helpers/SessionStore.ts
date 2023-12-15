import t from "../i18n";
import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";
import EventBus from "../utils/EventBus";

let initialized = false;

const SessionStore = () => {
  const store = {
    session: {
      totalActions: 0,
      totalActionsJointLength: 0,
      items: 0,
      errorLog: [],
    } as Partial<SessionData>,
  };

  const end = () => {
    if (!initialized) {
      throw new Error(t("session_Store.error.not_initialized"));
    }

    const endDate = new Date();

    store.session = {
      ...store.session,
      endDate,
      duration: endDate.getTime() - store.session.startDate!.getTime(),
    };

    initialized = false;

    return current();
  };

  const current = (): SessionData => ({ ...store.session }) as SessionData;

  const init = (config: SessionConfig) => {
    if (initialized) {
      throw new Error(t("session_store.error.initialized"));
    }

    store.session = {
      ...store.session,
      startDate: new Date(),
      ...config,
      location: config.offset,
    };

    EventBus.on("ACTION:COUNT", countAction);

    initialized = true;

    return sessionStore;
  };

  const countAction = (speed: number): void => {
    store.session.totalActions! += 1;
    store.session.totalActionsJointLength! += speed * store.session.taskLength!;
  };

  const updateLocation = (item: string, page?: number): void => {
    store.session.location!.item = item;
    store.session.location!.page = page ?? store.session.location!.page;
  };

  const logError = (error: Error, isCritical?: boolean): void => {
    store.session.errorLog?.push({
      error,
      isCritical: !!isCritical,
      time: new Date(),
      location: {
        ...store.session.location!,
        itemNumber: store.session.items!,
      },
      actionNumber: store.session.totalActions!,
    });
  };

  const sessionStore = {
    init,
    current,
    end,
    countAction,
    logError,
    updateLocation,
  };

  return sessionStore;
};

export default SessionStore;
