import pino from "pino";

const logger = pino();

export const warningMessage = (message: string) => logger.warn(message);

export const infoMessage = (message: string) => logger.info(message);

export const errorMessage = (message: string) => logger.error(message);

export default logger;
