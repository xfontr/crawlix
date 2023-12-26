import { CustomFunction, PromiseFunction, tryCatch } from "@personal/utils";
import ScraperSpeed from "../types/ScraperSpeed";
import EventBus from "./EventBus";

let isSessionOn = true;

EventBus.on("SESSION:ACTIVE", (status: boolean) => {
  isSessionOn = status;
});

const useAction = (taskLength: number) => {
  const delay = async <T>(
    callback: CustomFunction<T>,
    speed: ScraperSpeed,
  ): Promise<T | void> =>
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(callback());
      }, speed * taskLength);
    });

  const action = async <T>(
    callback: CustomFunction<T> | PromiseFunction<T>,
    speed: ScraperSpeed,
    isCritical: boolean,
  ): Promise<[void | Awaited<T>, void | Error]> => {
    if (!isSessionOn) return [undefined, undefined];

    const [response, error] = await tryCatch<T>(delay, callback, speed);

    EventBus.emit("ACTION:COUNT", speed);

    error && EventBus.emit("SESSION:ERROR", error, isCritical);

    return [response as Awaited<T>, error];
  };

  const $a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, false);

  const $$a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, true);

  return {
    $a,
    $$a,
    action: $a,
    criticalAction: $$a,
  };
};

export default useAction;
