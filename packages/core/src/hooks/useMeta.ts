import { randomUUID } from "crypto";
import {
  useActionStore,
  useLocationStore,
  useRuntimeConfigStore,
} from "../stores";
import type {
  ActionMeta,
  ActionStore,
  ActionSyncInstance,
  CustomError,
  FullObject,
  ItemMeta,
  ItemStore,
  LocationMeta,
  LocationStore,
  LogData,
  LogMeta,
  LogStore,
  Meta,
} from "../types";
import { buildItemMeta, generateDate, generateTimestamp } from "../utils";

const generateId = (): string => randomUUID();

const useMeta = () => {
  const {
    isMinimal,
    current: { public: config },
  } = useRuntimeConfigStore();

  const get = (index?: number, skipLocation?: boolean): Meta =>
    isMinimal()
      ? ({} as Meta)
      : {
          id: generateId(),
          ...(skipLocation
            ? {}
            : { location: useLocationStore().getCurrentLocation() }),
          ...(index ? { index } : {}),
        };

  const getItemMeta = <T extends FullObject>(
    state: ItemStore<T>,
    required?: (keyof Partial<T>)[],
  ): ItemMeta<T> => ({
    ...get(state.totalItems + config.offset.index),
    ...(isMinimal() ? ({} as ItemMeta<T>) : buildItemMeta(state, required)),
  });

  const getActionMeta = (
    { totalActions }: ActionStore,
    action: ActionSyncInstance,
  ) => {
    let syncMeta: ActionMeta | undefined = {
      ...get(totalActions + 1),
      ...(isMinimal()
        ? ({} as ActionMeta)
        : {
            depth: action.depth,
            mockedDuration: action.mockedDuration,
            ...(action.isCritical ? { isCritical: action.isCritical } : {}),
          }),
    };

    return {
      syncMeta,
      addAsyncMeta: (error?: CustomError): Pick<ActionMeta, "error"> => {
        syncMeta = undefined;

        return {
          ...(!error || isMinimal()
            ? ({} as Pick<ActionMeta, "error">)
            : { error: error.id! }),
        };
      },
    };
  };

  const getLogMeta = (
    { totalLogs }: LogStore,
    baseLog: LogData | string,
  ): LogMeta =>
    isMinimal()
      ? ({} as LogMeta)
      : {
          ...get(totalLogs),
          category:
            typeof baseLog === "string"
              ? "USER_INPUT"
              : baseLog.category ?? "USER_INPUT",
        };

  const getLocationMeta = ({
    history,
    totalLocations,
  }: LocationStore): LocationMeta => {
    const { currentRef } = useActionStore().current;
    const date = generateDate();

    return isMinimal()
      ? ({} as LocationMeta)
      : {
          ...get(totalLocations + 1, true),
          timestamp: generateTimestamp(history[0]?.date ?? date, date),
          date,
          ...(currentRef?.id ? { lastAction: currentRef?.id } : {}),
        };
  };

  return { get, getItemMeta, getActionMeta, getLogMeta, getLocationMeta };
};

export default useMeta;
