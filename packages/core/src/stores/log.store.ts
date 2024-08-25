import type {
  ActionSyncInstance,
  CustomError,
  LocationInstance,
  Log,
  LogData,
  LogStore,
} from "../types";
import { useLocationStore, useRuntimeConfigStore } from ".";
import { generateId, stringifyWithKeys } from "../utils/utils";
import EventBus from "../utils/EventBus";
import { createStore } from "../utils/stores";

const DEFAULT_OPTIONS: Required<Omit<LogData, "message">> = {
  name: "LOG ENTRY",
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
    ): Log | undefined => {
      const logEntry: Log = {
        id: generateId(),
        ...DEFAULT_OPTIONS,
        ...(typeof baseLog === "string"
          ? { message: baseLog }
          : structuredClone(baseLog)),
        index: state.totalLogs,
        location: getCurrentLocation(),
      };

      if (
        !forceLog &&
        (logging.categories.includes(logEntry.category) ||
          logging.types.includes(logEntry.type) ||
          logEntry.criticality <= logging.maxCriticality)
      ) {
        return;
      }

      state.totalLogs += 1;
      state.logs.push(logEntry);

      EventBus.emit("LOGGER:LOG", structuredClone(logEntry));
      return logEntry;
    };

    const logAction = (action: ActionSyncInstance, log?: boolean) => {
      pushLog(
        {
          name: action.name ?? `Executed action n. '${action.index}'`,
          message: stringifyWithKeys({
            id: action.id,
            depth: action.depth,
            mocked_duration: action.mockedDuration,
          }),
          type: "INFO",
          // +1 ensures that an action criticality won't equal a fatal error
          criticality: action.depth + 1,
          category: "ACTION",
        },
        log,
      );
    };

    const logError = (error: CustomError, log?: boolean) => {
      pushLog(
        {
          name: `Logged a '${error.criticality}' error: '${error.name}'`,
          message: stringifyWithKeys({
            id: error.id,
            message: error?.message,
            stack: error?.stack,
          }),
          type: "ERROR",
          ...(error.criticality
            ? { criticality: ERROR_CRITICALITY[error.criticality] }
            : {}),
          category: "ERROR",
        },
        log,
      );
    };

    const logLocation = (location: LocationInstance, log?: boolean) => {
      pushLog(
        {
          name: location?.name ?? "Location updated",
          message: stringifyWithKeys({
            id: location.id,
            page: location?.page,
            url: location?.url,
          }),
          type: "INFO",
          category: "USER_INPUT",
        },
        log,
      );
    };

    return { pushLog, logAction, logError, logLocation };
  },
);

export default useLogStore;
