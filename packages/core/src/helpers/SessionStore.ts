import { randomUUID } from "crypto";
import t from "../i18n";
import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";
import EventBus from "../utils/EventBus";
import DefaultItem from "../types/DefaultItem";

let initialized = false;

const SessionStore = () => {
  const store = {
    session: {
      _id: randomUUID(),
      totalActions: 0,
      totalActionsJointLength: 0,
      items: [],
      errorLog: [],
      totalItems: 0,
    } as Partial<SessionData>,
  };

  const end = () => {
    if (!initialized) {
      throw new Error(t("session_store.error.not_initialized"));
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
      location: { ...config.offset } as Required<SessionConfig["offset"]>,
      history: [config.offset.url!],
    };

    EventBus.on("ACTION:COUNT", countAction);

    initialized = true;

    return sessionStore;
  };

  const countAction = (speed: number): void => {
    store.session.totalActions! += 1;
    store.session.totalActionsJointLength! += speed * store.session.taskLength!;
  };

  const updateLocation = ({
    page,
    item,
    url,
  }: Partial<
    Omit<Omit<SessionData["location"], "itemNumber">, "errorMargin">
  >): void => {
    store.session.location!.item = item ?? store.session.location!.item;
    store.session.location!.page = page ?? store.session.location!.page;
    store.session.location!.url = url ?? store.session.location!.url;
  };

  const nextPage = (url: string): void => {
    store.session.location!.url = url;
    store.session.location!.page += 1;
    store.session.history!.push(url);
  };

  const previousPage = (url: string): void => {
    store.session.location!.url = url;
    store.session.location!.page -= 1;
    store.session.history!.push(url);
  };

  const logError = (error: Error, isCritical?: boolean): void => {
    store.session.errorLog!.push({
      error,
      isCritical: !!isCritical,
      time: new Date(),
      location: {
        ...store.session.location!,
        itemNumber: store.session.totalItems!,
      },
      actionNumber: store.session.totalActions!,
    });
  };

  const postItem = <T = DefaultItem>(item?: T, selector = ""): boolean => {
    if (!item || store.session.totalItems! >= store.session.limit!)
      return false;

    store.session.items?.push({
      ...item,
      _meta: {
        id: randomUUID(),
        itemNumber: store.session.totalItems!,
        page: store.session.location!.page,
        posted: new Date(),
        selector,
      },
    });

    store.session.totalItems = store.session.items!.length;

    if (store.session.totalItems >= store.session.limit!) {
      EventBus.emit("SESSION:ACTIVE", false);
    }

    return true;
  };

  const sessionStore = {
    init,
    current,
    end,
    countAction,
    logError,
    updateLocation,
    nextPage,
    previousPage,
    postItem,
  };

  return sessionStore;
};

export default SessionStore;
