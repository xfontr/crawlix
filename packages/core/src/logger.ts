import pino from "pino";
import EventBus from "./utils/EventBus";

const logger = pino();

export const warningMessage = (message: string) => {
  EventBus.emit("SESSION:LOG", message);
  logger.warn(message);
};

export const infoMessage = (message: string) => {
  EventBus.emit("SESSION:LOG", message);
  logger.info(message);
};

export const errorMessage = (message: string) => {
  EventBus.emit("SESSION:LOG", message);
  logger.error(message);
};

export default logger;
