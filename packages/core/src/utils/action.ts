import { CustomFunction, tryCatch } from "@personal/utils";
import ScraperSpeed from "../types/ScraperSpeed";
import EventBus from "./EventBus";
import { errorMessage } from "../logger";

const countAction = (speed: number): boolean =>
  EventBus.emit("COUNT_ACTION", speed);

const action = (taskLength: number) => {
  const delay = async <T>(
    callback: CustomFunction<T>,
    speed: ScraperSpeed,
  ): Promise<T | void> =>
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(callback());
      }, speed * taskLength);
    });

  return async <T>(
    callback: CustomFunction<T>,
    speed: ScraperSpeed = 0,
  ): Promise<T | void> => {
    const [response, error] = await tryCatch(() => delay(callback, speed));

    if (error) {
      errorMessage((error as Error).message);
      countAction(0);
      EventBus.emit("END_SESSION"); // TODO: Do we always want to abruptly end session on each task?
      return;
    }

    countAction(speed);
    return response as T;
  };
};

export default action;
