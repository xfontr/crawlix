import { useLogStore, useRuntimeConfigStore } from "../stores";
import type { FullFunction, LogData } from "../types";
import { consoleLog } from "../utils/consoleLog";

let rawLog: FullFunction = consoleLog;

const useLog = () => {
  const { logging } = useRuntimeConfigStore().current.public;
  const { pushLog } = useLogStore();

  const log = (logInstance: LogData | string, forceLog?: boolean): void => {
    const logResult = pushLog(logInstance, forceLog, false);

    if (!logResult) return;

    rawLog(
      logging.isSimple
        ? {
            category: logResult.category,
            type: logResult.type,
            name: logResult.name ?? logResult.message,
          }
        : logResult,
    );
  };

  const setLogger = (newLogger: FullFunction): void => {
    rawLog = newLogger;
  };

  return { log, rawLog, setLogger };
};

export default useLog;
