import ScraperSpeed from "../types/ScraperSpeed";
import EventBus, { events } from "../utils/EventBus";

type PromiseFunction = <T>() => Promise<T | void>;

const ScraperAction = (taskLength: number) => {
  const delay = async <T extends PromiseFunction>(
    callback: T,
    speed: ScraperSpeed,
  ): Promise<T | void> =>
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(callback());
      }, speed * taskLength);
    });

  const countAction = (speed: number) => {
    EventBus.emit(events.countAction, speed);
  };

  return {
    delay,
    countAction,
  };
};

export default ScraperAction;
