import { CustomFunction, tryCatch } from "@personal/utils";
import ScraperSpeed from "../types/ScraperSpeed";
import EventBus from "./EventBus";

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
    callback: CustomFunction<T>,
    speed: ScraperSpeed,
    isCritical: boolean,
    isItem: boolean,
  ): Promise<T | void> => {
    const [response, error] = await tryCatch(() => delay(callback, speed));

    EventBus.emit("ACTION:COUNT", speed, isItem);
    EventBus.emit("SESSION:ERROR", error, isCritical);

    return (response as T) ?? undefined;
  };

  const $a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, false, false);

  const $$a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, true, false);

  const $i = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, false, true);

  const $$i = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, true, true);

  return {
    $a,
    $$a,
    $i,
    $$i,
    action: $a,
    criticalAction: $$a,
    item: $i,
    criticalItem: $i,
  };
};

export default useAction;
