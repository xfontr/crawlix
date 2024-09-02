import type {
  ActionSyncInstance,
  CustomError,
  LocationInstance,
  Log,
  LogData,
  LogStore,
} from "../types";
import { useLocationStore, useRuntimeConfigStore } from ".";
import { stringifyWithKeys } from "../utils/utils";
import EventBus from "../utils/EventBus";
import { createStore } from "../utils/stores";
import { getMeta } from "../utils/metaData";

const DEFAULT_OPTIONS: Required<Omit<LogData, "message">> = {
  name: "Unnamed",
  criticality: 5,
  type: "INFO",
  category: "USER_INPUT",
};

const ERROR_CRITICALITY: Record<Required<CustomError>["criticality"], number> =
  {
    FATAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

const useLogStore = createStore(
  "log",
  { totalLogs: 0, logs: [] } as LogStore,
  (state) => {
    const { getCurrentLocation } = useLocationStore();
    const { logging } = useRuntimeConfigStore().current.public;

    const pushLog = (
      baseLog: LogData | string,
      forceLog?: boolean,
      consoleLog = true,
    ): Log | undefined => {
      const logEntry: Log = {
        ...getMeta(state.totalLogs),
        ...DEFAULT_OPTIONS,
        ...(typeof baseLog === "string"
          ? { name: baseLog }
          : structuredClone(baseLog)),
        location: getCurrentLocation(),
      };

      if (!forceLog)
        if (
          !(
            logging.categories.includes(logEntry.category) &&
            logging.types.includes(logEntry.type)
          ) ||
          logging.maxCriticality < logEntry.criticality
        ) {
          return;
        }

      state.totalLogs += 1;
      state.logs.push(logEntry);

      if (consoleLog) EventBus.log.emit(structuredClone(logEntry));
      return logEntry;
    };

    const logAction = (
      { id, depth, name, index }: ActionSyncInstance,
      log?: boolean,
    ) => {
      pushLog(
        {
          name: name ?? `Executed action n. '${index}'`,
          message: stringifyWithKeys({ id }),
          type: "INFO",
          criticality: depth + 1, // So that it won't be as critical as a fatal error
          category: "ACTION",
        },
        log,
      );
    };

    const logError = (
      { criticality, name, id, message, stack }: CustomError,
      log?: boolean,
    ) => {
      pushLog(
        {
          name: `Logged a '${criticality}' error: '${name}'`,
          message: stringifyWithKeys({ id, message, stack }),
          type: "ERROR",
          ...(criticality
            ? { criticality: ERROR_CRITICALITY[criticality] }
            : {}),
          category: "ERROR",
        },
        log,
      );
    };

    const logLocation = (
      { name, id, page, url }: LocationInstance,
      log?: boolean,
    ) => {
      pushLog(
        {
          name: name ?? "Location updated",
          message: stringifyWithKeys({ id, page, url }),
          type: "INFO",
          category: "LOCATION",
        },
        log,
      );
    };

    return { pushLog, logAction, logError, logLocation };
  },
);

export default useLogStore;
