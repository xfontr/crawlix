import {
  useLocationStore,
  useRuntimeConfigStore,
  useSessionStore,
} from "../stores";
import type {
  FullFunction,
  FullFunctionWithApp,
  FullFunctionWithIndex,
  Session,
} from "../types";
import { outputStores } from "../utils/stores";
import EventBus from "../utils/EventBus";
import { runAfterAllInSeq, promiseLoop } from "../utils/promises";
import useAction from "./useAction";
import useError from "./useError";

const state = {
  afterAllEffects: [] as FullFunction[],
};

const useSession = () => {
  const sessionStore = useSessionStore();
  const { limit, storeContent } = useRuntimeConfigStore().current;
  const locationStore = useLocationStore();
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
    }, limit.timeout);

    return options;
  };

  const end = async (status?: Session["status"]): Promise<void> => {
    if (sessionStore.isSessionOver()) return;

    locationStore.pushLocation({ name: "END LOCATION" });

    sessionStore.end(status);

    await $a(
      () =>
        runAfterAllInSeq(outputStores(storeContent), ...state.afterAllEffects),
      {
        name: "AFTER ALL EFFECTS",
      },
    );

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
