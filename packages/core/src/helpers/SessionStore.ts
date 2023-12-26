import { randomUUID } from "crypto";
import t from "../i18n";
import type SessionConfig from "../types/SessionConfig";
import type SessionData from "../types/SessionData";
import EventBus from "../utils/EventBus";
import DefaultItem from "../types/DefaultItem";
import { warningMessage } from "../logger";
import { objectKeys, objectValues } from "@personal/utils";
import isItemComplete from "../utils/isItemComplete";

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
      endDate,
      duration: endDate.getTime() - store.session.startDate!.getTime(),
      success,
      incompleteItems: store.session.items!.reduce(
        (total, { _meta: { fails } }) => (total + fails > 0 ? 1 : 0),
        0,
      ),
    };

    if (store.session.success) {
      const minimumItemsToSuccess =
        store.session.minimumItemsToSuccess! <= 1
          ? store.session.minimumItemsToSuccess! * store.session.items!.length +
            store.session.incompleteItems!
          : store.session.minimumItemsToSuccess!;

      store.session.success =
        store.session.items!.length <= minimumItemsToSuccess
          ? store.session.success
          : false;
    }

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

  const postItem = <T = DefaultItem>(
    item: T | undefined,
    errorLog: Record<string, Error | void>,
    selector = "",
  ): void => {
    if (store.session.totalItems! >= store.session.limit!.items!) return;

    store.session.items!.push({
      ...item,
      _meta: {
        id: randomUUID(),
        itemNumber: store.session.totalItems!,
        page: store.session.location!.page,
        posted: new Date(),
        isComplete: isItemComplete(item),
        selector,
        errorLog,
        fails: item ? objectKeys(errorLog).filter((error) => !error).length : 1,
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
