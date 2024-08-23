import { useLogStore, useRuntimeConfigStore } from "../stores";
import type { FullFunction, Log, LogData } from "../types";
import { consoleLog } from "../utils/consoleLog";

let rawLog: FullFunction = consoleLog;

const useLog = () => {
  const registerIfNew = (logInstance: Log | LogData | string): Log => {
    const {
      pushLog,
      current: { logs },
    } = useLogStore();

    if (typeof logInstance === "string" || !logInstance.type) {
      pushLog(logInstance, false);
      return logs.at(-1)!;
    }

    return logInstance as Log;
  };

  const log = (logInstance: LogData | string): void => {
    const { logging } = useRuntimeConfigStore().current.public;

    const finalLogInstance = registerIfNew(logInstance);

    if (
      logging.typeFilter.includes(finalLogInstance.type) &&
      finalLogInstance.criticality <= logging.maxCriticality
    ) {
      rawLog(finalLogInstance);
    }
  };

  const setLogger = (newLogger: FullFunction) => {
    rawLog = newLogger;
  };

  return { log, rawLog, setLogger };
};

export default useLog;
