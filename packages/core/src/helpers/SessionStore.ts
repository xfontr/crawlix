import { randomUUID } from "crypto";
import t from "../i18n";
import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";
import EventBus from "../utils/EventBus";
import DefaultItem from "../types/DefaultItem";
import { warningMessage } from "../logger";
import isItemComplete from "../utils/isItemComplete";
import { usageDataLogError } from "../utils/usageData";
import getTimeDifference from "../utils/getTimeDifference";

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
      success: true,
    } as Partial<SessionData>,
  };

  const end = (success = true) => {
    if (!initialized) {
      throw new Error(t("session_store.error.not_initialized"));
    }

    const endDate = new Date();

    store.session = {
      ...store.session,
      endDate: endDate.getTime(),
      duration: getTimeDifference(store.session.startDate!, endDate),
      success,
      incompleteItems: store.session.items!.reduce(
        (total, { _meta: { isComplete } }) => total + (isComplete ? 0 : 1),
        0,
      ),
    };

    if (store.session.success) {
      const minimumItemsToSuccess =
        store.session.minimumItemsToSuccess! <= 1
          ? Math.ceil(
              store.session.minimumItemsToSuccess! * store.session.totalItems!,
            )
          : store.session.minimumItemsToSuccess!;

      store.session.success =
        store.session.totalItems! - store.session.incompleteItems! >=
        minimumItemsToSuccess
          ? store.session.success
          : false;
    }

    initialized = false;

    return current();
  };

  const current = (): SessionData => store.session as SessionData;

  const init = (config: SessionConfig) => {
    if (initialized) {
      throw new Error(t("session_store.error.initialized"));
    }

    store.session = {
      ...store.session,
      startDate: new Date().getTime(),
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
    url,
  }: Partial<
    Omit<Omit<SessionData["location"], "itemNumber">, "errorMargin">
  >): void => {
    store.session.location!.page = page ?? store.session.location!.page;
    store.session.location!.url = url ?? store.session.location!.url;

    if (page && store.session.limit!.page && page >= store.session.limit!.page)
      EventBus.emit("SESSION:ACTIVE", false);
  };

  const nextPage = (url?: string): void => {
    updateLocation({ page: store.session.location!.page + 1, url: url ?? "" });
    url && store.session.history!.push(url);
  };

  const previousPage = (url?: string): void => {
    updateLocation({ url: url ?? "" });

    url && store.session.history!.push(url);

    if (!store.session.location!.page) {
      warningMessage(t("session_store.warning.no_previous_page"));
      return;
    }

    updateLocation({ page: store.session.location!.page - 1 });
  };

  const logError = (error: Error, isCritical?: boolean): void => {
    const endDate = new Date();

    store.session.errorLog!.push({
      error: {
        name: error.name,
        message: error.message,
      },
      isCritical: !!isCritical,
      date: endDate.getTime(),
      moment: getTimeDifference(store.session.startDate!, endDate),
      location: {
        ...store.session.location!,
        itemNumber: store.session.totalItems!,
      },
      actionNumber: store.session.totalActions!,
    });

    store.session.usageData &&
      usageDataLogError(store.session.errorLog!.at(-1));
  };

  const postItem = <T = DefaultItem>(
    item: T | undefined,
    errorLog: Partial<Record<keyof T, Error>>,
    selector = "",
  ): void => {
    if (store.session.totalItems! >= store.session.limit!.items!) return;

    store.session.items!.push({
      ...item,
      _meta: {
        id: randomUUID(),
        itemNumber: store.session.totalItems!,
        page: store.session.location!.page,
        posted: new Date().getTime(),
        moment: getTimeDifference(store.session.startDate!),
        isComplete: isItemComplete(item),
        selector,
        errorLog,
        url: current().history.at(-1)!,
      },
    });

    store.session.totalItems = store.session.items!.length;

    if (store.session.totalItems >= store.session.limit!.items!)
      EventBus.emit("SESSION:ACTIVE", false);
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
