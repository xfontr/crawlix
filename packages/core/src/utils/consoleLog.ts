import { FullFunction, Log } from "../types";

const headLog = ({
  name,
  message,
  category,
  body,
}: Log & { body?: string }): string => {
  if (body) return body;

  if (!message) return `${category}: ${name}`;
  return `${name}. Details: ${message}`;
};

const bodyLog = (logInstance: Log & { body?: string }): string => {
  const { body, ...rest } = logInstance;

  if (body) return "";

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
