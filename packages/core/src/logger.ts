import pino from "pino";

const logger = pino();

export const warningMessage = (message: string) => {
  debugger;
  logger.warn(message);
  debugger;
  return "haha";
};
export const infoMessage = (message: string) => logger.info(message);

export default logger;
