import type {
  ActionSyncInstance,
  CustomError,
  LocationInstance,
  Log,
  LogData,
  LogStore,
} from "../types";
import { useRuntimeConfigStore } from ".";
import { stringifyWithKeys } from "../utils/utils";
import EventBus from "../utils/EventBus";
import { createStore } from "../helpers/stores";
import { useMeta } from "../hooks";

const useLogStore = createStore(
  "log",
  { totalLogs: 0, logs: [] } as LogStore,
  (state) => {
    const { logging } = useRuntimeConfigStore().current.public;

    const pushLog = (
      baseLog: LogData | string,
      forceLog?: boolean,
      consoleLog = true,
    ): Log | undefined => {
      const isText = typeof baseLog === "string";

      const logEntry: Log = {
        ...useMeta().getLogMeta(state, baseLog),
        type: isText ? "INFO" : baseLog.type ?? "INFO",
        name: isText ? "Message" : baseLog.name ?? "Message",
        ...(isText || baseLog.message
          ? { message: isText ? baseLog : baseLog.message }
          : {}),
      };

      if (!forceLog)
        if (
          !(
            logging.categories.includes(logEntry.category) &&
            logging.types.includes(logEntry.type)
          )
        ) {
          return;
        }

      state.totalLogs += 1;
      state.logs.push(logEntry);

      if (consoleLog) EventBus.log.emit(structuredClone(logEntry));
      return logEntry;
    };

    const logAction = (
      { id, name, index }: ActionSyncInstance,
      log?: boolean,
    ) => {
      pushLog(
        {
          name: name ?? `Executed action n. '${index}'`,
          message: stringifyWithKeys({ id }),
          type: "INFO",
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
