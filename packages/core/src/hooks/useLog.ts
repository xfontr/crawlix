import { useLogStore } from "../stores";
import type { FullFunction, LogData } from "../types";
import { consoleLog } from "../utils/consoleLog";

let rawLog: FullFunction = consoleLog;

const useLog = () => {
  const log = (logInstance: LogData | string, forceLog?: boolean): void => {
    const logResult = useLogStore().pushLog(logInstance, forceLog);
    if (logResult) rawLog(logResult);
  };

  const setLogger = (newLogger: FullFunction): void => {
    rawLog = newLogger;
  };

  return { log, rawLog, setLogger };
};

export default useLog;
