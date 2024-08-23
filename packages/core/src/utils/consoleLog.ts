import { FullFunction, Log } from "../types";

const headLog = ({ name, message }: Log): string => `[${name}] ${message}`;

const bodyLog = (logInstance: Log): string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { message, name, ...rest } = logInstance;

  return JSON.stringify(rest, null, 4);
};

export const consoleLog = (logInstance: Log | string): void => {
  if (
    typeof logInstance !== "object" ||
    (typeof logInstance === "object" && !logInstance.type)
  ) {
    console.log(logInstance);
    return;
  }

  const options: Record<Log["type"], FullFunction> = {
    DEBUG: console.debug,
    DEV: console.log,
    ERROR: console.error,
    INFO: console.info,
    WARN: console.warn,
  };

  options[logInstance.type]?.(headLog(logInstance), bodyLog(logInstance));
};
