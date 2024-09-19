import type { FullFunction, LogData } from "../types";
import { useLogStore, useRuntimeConfigStore } from "../stores";
import { consoleLog } from "../utils";

let rawLog: FullFunction = consoleLog;

const useLog = () => {
  const { logging } = useRuntimeConfigStore().current.public;
  const { pushLog } = useLogStore();

  const log = (logInstance: LogData | string, forceLog?: boolean): void => {
    const logResult = pushLog(logInstance, forceLog, false);

    if (!logResult) return;

    print(logResult);
  };

  const print = (logInstance: LogData): void => {
    rawLog(
      logging.isSimple.includes(logInstance.category)
        ? {
            category: logInstance.category,
            type: logInstance.type,
            body: `[${logInstance.type}] ${logInstance.category}: ${logInstance.name} - ${logInstance.message}`,
          }
        : logInstance,
    );
  };

  const setLogger = (newLogger: FullFunction): void => {
    rawLog = newLogger;
  };

  return { log, print, rawLog, setLogger };
};

export default useLog;
