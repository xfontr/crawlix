import { FullFunction, Log } from "../types";

const SIMPLE_INSTANCE_LENGTH = 2;

const headLog = ({ name, message, category }: Log): string => {
  if (!message) return `${category}: ${name}`;
  return `${name}. Details: ${message}`;
};

const bodyLog = (logInstance: Log): string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name, message, ...rest } = logInstance;

  if (Object.keys(rest).length === SIMPLE_INSTANCE_LENGTH) return "";

  return JSON.stringify(rest, null, 4);
};

export const consoleLog = (logInstance: Log): void => {
  if (!logInstance.type) return;

  const options: Record<Log["type"], FullFunction> = {
    DEBUG: console.debug,
    DEV: console.log,
    ERROR: console.error,
    INFO: console.info,
    WARN: console.warn,
  };

  options[logInstance.type]?.(headLog(logInstance), bodyLog(logInstance));
};
