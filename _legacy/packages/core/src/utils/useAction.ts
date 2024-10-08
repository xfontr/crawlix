import { CustomFunction, PromiseFunction, tryCatch } from "@personal/utils";
import ScraperSpeed from "../types/ScraperSpeed";
import EventBus from "../helpers/EventBus";
import t from "../i18n";
import { DEFAULT_ERROR_NAME } from "../configs/constants";

export const randomize = (multiplier: number): number =>
  +(Math.random() * multiplier).toFixed(1) + 1;

const useAction = (taskLength: number, randomMultiplier = 1) => {
  let isSessionOn = true;

  EventBus.on("SESSION:ACTIVE", (status: boolean) => {
    isSessionOn = status;
  });

  const delay = async <T>(
    callback: CustomFunction<T>,
    speed: ScraperSpeed,
  ): Promise<T | void> => {
    if (speed * taskLength === 0) return callback();

    return await new Promise((resolve) => {
      setTimeout(
        () => {
          resolve(callback());
        },
        speed * taskLength * randomize(randomMultiplier), // TODO: Test actual implementation + Is this being added to the time counter?
      );
    });
  };

  const action = async <T>(
    callback: CustomFunction<T> | PromiseFunction<T>,
    speed: ScraperSpeed,
    isCritical: boolean,
  ): Promise<[void | Awaited<T>, void | Error]> => {
    if (!isSessionOn) return [undefined, undefined];

    const [response, error] = await tryCatch<T>(delay, callback, speed);

    EventBus.emit("ACTION:COUNT", speed);

    error &&
      EventBus.emit("SESSION:ERROR", error, {
        name:
          error.name === DEFAULT_ERROR_NAME
            ? t("error_index.action")
            : error.name,
        publicMessage: t("session_actions.error.default"),
        isCritical,
      });

    return [response as Awaited<T>, error];
  };

  const $a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, false);

  const $$a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, true);

  return {
    /**
     * @description Normal action. If an error is handled, will not break the app.
     */
    $a,
    /**
     * @description Critical action. If an error is handled, will break the app.
     */
    $$a,
  };
};

export default useAction;
