import { useLogStore, useRuntimeConfigStore } from "../stores";
import type { FullFunction, LogData } from "../types";
import { consoleLog } from "../utils/consoleLog";

let rawLog: FullFunction = consoleLog;

const useLog = () => {
  const log = (logInstance: LogData | string, forceLog?: boolean): void => {
    const { logging } = useRuntimeConfigStore().current.public;
    const logResult = useLogStore().pushLog(logInstance, forceLog);

    if (!logResult) return;

    rawLog(logging.isSimple ? logResult.name ?? logResult.message : logResult);
  };

  const setLogger = (newLogger: FullFunction): void => {
    rawLog = newLogger;
  };

  return { log, rawLog, setLogger };
};

export default useLog;
