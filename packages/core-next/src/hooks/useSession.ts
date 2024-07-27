import * as stores from "../stores";
import type {
  App,
  AppData,
  FullFunction,
  FullFunctionWithApp,
  FullFunctionWithIndex,
  Session,
} from "../types";
import EventBus from "../utils/EventBus";
import { runAfterAllInSeq, promiseLoop } from "../utils/promises";
import useAction from "./useAction";
import useError from "./useError";

const state = {
  afterAllEffects: [] as FullFunction[],
};

const useSession = () => {
  const sessionStore = stores.useSessionStore();
  const { configs } = stores.useRuntimeConfigStore();
  const locationStore = stores.useLocationStore();
  const { $a } = useAction();

  const init = () => {
    sessionStore.init();

    setTimeout(() => {
      useError().createError({
        criticality: "FATAL",
        message: "Session timed out",
        name: "GLOBAL TIMEOUT",
        type: "TIMEOUT",
      });
    }, configs().limit.timeout);

    return options;
  };

  const end = async (status?: Session["status"]): Promise<void> => {
    if (sessionStore.isSessionOver()) return;

    const { storeContent } = stores.useRuntimeConfigStore().configs();

    locationStore.pushLocation({ name: "END LOCATION" });

    sessionStore.end(status);

    const storeDictionary: Record<keyof AppData, string> = {
      configs: "useRuntimeConfigStore",
      actionData: "useActionStore",
      logData: "useLogStore",
      errorData: "useErrorStore",
      locationData: "useLocationStore",
      itemData: "useItemStore",
    };

    const output = Object.entries(storeDictionary).reduce(
      (finalStore, [key, value]) => {
        if (!storeContent.includes(key as keyof AppData)) return finalStore;
        return {
          ...finalStore,
          // eslint-disable-next-line, import/namespace
          // eslint-disable-next-line import/namespace
          [key]: (
            stores[value as keyof typeof stores]?.() as { output: () => object }
          )?.output?.(),
        };
      },
      stores.useSessionStore().output(),
    ) as App & Partial<AppData>;

    await $a(() => runAfterAllInSeq(output, ...state.afterAllEffects), {
      name: "AFTER ALL EFFECTS",
    });

    EventBus.emit("SESSION:CLEAN_UP");
  };

  const loop = async (
    callback: FullFunctionWithIndex,
    breakingCondition: (index: number) => boolean,
  ): Promise<void> => {
    await $a(() => promiseLoop(callback, breakingCondition), {
      name: "LOOP",
    });
  };

  const afterAll = (callback: FullFunctionWithApp): void => {
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
