import useErrorStore from "../stores/error.store";
import useItemStore from "../stores/item.store";
import useLocationStore from "../stores/location.store";
import useLogStore from "../stores/log.store";
import useRuntimeConfigStore from "../stores/runtimeConfig.store";
import useSessionStore from "../stores/session.store";
import type { FullFunction } from "../types/Object.type";
import type { Session } from "../types/Session.type";
import { App } from "../types/Store.type";
import EventBus from "../utils/EventBus";
import { promiseAllSeq, promiseLoop } from "../utils/promises";
import useAction from "./useAction";

const state = {
  afterAllEffects: [] as FullFunction[],
};

const useSession = () => {
  const sessionStore = useSessionStore();
  const { getRuntimeConfig } = useRuntimeConfigStore();
  const locationStore = useLocationStore();
  const { $a } = useAction();

  const init = () => {
    sessionStore.init();

    setTimeout(() => {
      EventBus.emit("SESSION:END");
    }, getRuntimeConfig().limit.timeout);

    return options;
  };

  const end = async (status?: Session["status"]): Promise<App> => {
    if (sessionStore.isSessionOver()) return {} as Promise<App>;

    await $a(() => promiseAllSeq(...state.afterAllEffects), {
      name: "AFTER ALL EFFECTS",
      type: "DEV",
    });

    locationStore.pushLocation({ name: "END_LOCATION" });

    sessionStore.end(status);

    const output: App = {
      ...sessionStore.output(),
      configs: getRuntimeConfig(),
      logData: useLogStore().output(),
      errorData: useErrorStore().output(),
      locationData: locationStore.output(),
      itemData: useItemStore().output(),
    };

    return output;
  };

  const loop = async (
    callback: FullFunction,
    breakingCondition: () => boolean,
  ): Promise<void> => {
    await $a(() => promiseLoop(callback, breakingCondition), {
      name: "LOOP",
      type: "DEV",
    });
  };

  const afterAll = (callback: FullFunction): void => {
    state.afterAllEffects.push(callback);
  };

  const options = {
    init,
    end,
    loop,
    afterAll,
  };

  return options;
};

export default useSession;
