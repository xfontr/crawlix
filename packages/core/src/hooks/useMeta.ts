import { randomUUID } from "crypto";
import {
  useActionStore,
  useLocationStore,
  useRuntimeConfigStore,
} from "../stores";
import type { Meta } from "../types/Meta.type";
import type {
  ActionMeta,
  ActionStore,
  CustomError,
  FullObject,
  ItemMeta,
  ItemStore,
  LocationMeta,
  LocationStore,
  LogData,
  LogMeta,
  LogStore,
} from "../types";
import { buildItemMeta } from "../utils/itemMetaData";
import { generateDate, generateTimestamp } from "../utils/locationUtils";

const generateId = (): string => randomUUID();

const useMeta = () => {
  const {
    isMinimal,
    isRelational,
    current: { public: config },
  } = useRuntimeConfigStore();
  const locationStore = useLocationStore();

  const get = (index?: number, skipLocation?: boolean) =>
    (isMinimal()
      ? {}
      : {
          id: generateId(),
          ...(skipLocation
            ? {}
            : { location: locationStore.getCurrentLocation(!isRelational()) }),
          ...(index ? { index } : {}),
        }) as Meta;

  const getItemMeta = <T extends FullObject>(
    state: ItemStore<T>,
    required?: (keyof Partial<T>)[],
  ): ItemMeta<T> => ({
    ...get(state.totalItems + config.offset.index),
    ...(isMinimal() ? ({} as ItemMeta<T>) : buildItemMeta(state, required)),
  });

  const getActionMeta = ({ totalActions, currentRef }: ActionStore) => {
    let syncMeta: ActionMeta | undefined = {
      ...get(totalActions + 1),
      ...(isMinimal()
        ? ({} as ActionMeta)
        : {
            depth: currentRef.depth,
            mockedDuration: currentRef.mockedDuration,
            ...(currentRef.isCritical
              ? { isCritical: currentRef.isCritical }
              : {}),
          }),
    };

    return {
      syncMeta,
      addAsyncMeta: (error?: CustomError): Pick<ActionMeta, "error"> => {
        syncMeta = undefined;

        return {
          ...(!error || isMinimal()
            ? ({} as Pick<ActionMeta, "error">)
            : { error: isRelational() ? error.id! : error }),
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
    const { currentRef: lastAction } = useActionStore().current;
    const date = generateDate();

    return isMinimal()
      ? ({} as LocationMeta)
      : {
          ...get(totalLocations + 1, true),
          timestamp: generateTimestamp(history[0]?.date ?? date, date),
          date,
          lastAction: isRelational() ? lastAction.id! : lastAction,
        };
  };

  return { get, getItemMeta, getActionMeta, getLogMeta, getLocationMeta };
};

export default useMeta;
