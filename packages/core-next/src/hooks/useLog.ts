import { useRuntimeConfigStore } from "../stores";
import type { FullFunction, Log } from "../types";

const useLog = <T extends FullFunction = FullFunction>(baseLogger?: T) => {
  const consoleLog = (prepend: string, logInstance: Log | string): void => {
    if (typeof logInstance === "string") {
      console.info(logInstance);
      return;
    }

    const options: Record<Log["type"], FullFunction> = {
      DEBUG: console.debug,
      DEV: console.log,
      ERROR: console.error,
      INFO: console.info,
      WARN: console.warn,
    };

    options[logInstance.type]?.(prepend, logInstance);
  };

  const logger = (logInstance: Log | string): void => {
    if (baseLogger) baseLogger("[LOGGER]", logInstance);
    if (!baseLogger) consoleLog("[LOGGER]", logInstance);
  };

  const log = (logInstance: Log): void => {
    const { logging, node } = useRuntimeConfigStore().configs();

    const finalLogInstance = logging.isSimple
      ? `[${logInstance.name}] ${logInstance.message}`
      : logInstance;

    if (!node.env.startsWith("dev") && logInstance.type === "DEV") {
      logger(finalLogInstance);
    } else if (
      logging.typeFilter.includes(logInstance.type) &&
      logInstance.criticality <= logging.maxCriticality &&
      logInstance.type !== "DEV"
    ) {
      logger(finalLogInstance);
    }
  };

  return { log, _dangerouslyLog: logger };
};

export default useLog;
