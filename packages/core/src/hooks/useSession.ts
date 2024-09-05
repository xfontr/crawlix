import {
  useLocationStore,
  useRuntimeConfigStore,
  useSessionStore,
} from "../stores";
import type {
  ActionCustomData,
  FullFunction,
  FullFunctionWithApp,
  FullFunctionWithIndex,
  Session,
} from "../types";
import { outputStores } from "../helpers/stores";
import EventBus from "../utils/EventBus";
import { runAfterAllInSeq, promiseLoop } from "../utils/promises";
import { useAction, useError, useLog } from ".";

const state = {
  beforeAllEffects: [] as FullFunction[],
  afterAllEffects: [] as FullFunctionWithApp[],
};

const useSession = () => {
  const sessionStore = useSessionStore();
  const config = useRuntimeConfigStore().current;
  const locationStore = useLocationStore();
  const { log } = useLog();
  const { $a } = useAction();

  const run = () => {
    sessionStore.init();

    const globalTimeout = setTimeout(() => {
      useError().createError({
        criticality: "FATAL",
        message: "Session timed out",
        name: "GLOBAL TIMEOUT",
        type: "TIMEOUT",
      });
    }, config.public.limit.timeout);

    EventBus.endSession.once((status: Session["status"]) => {
      if (status !== "TIMED_OUT") clearTimeout(globalTimeout);
    });

    return options;
  };

  const end = async (status?: Session["status"]): Promise<void> => {
    if (sessionStore.isSessionOver()) return;

    locationStore.pushLocation({ name: "END LOCATION" });

    sessionStore.end(status);

    await $a(
      () =>
        runAfterAllInSeq(
          outputStores(
            config.public.model,
            config.public.output.include,
            config.public.output.flatten,
          ),
          ...state.afterAllEffects,
        ),
      { name: "Executing after all effects" },
    );

    state.afterAllEffects = [];

    EventBus.sessionCleanUp.emit();
  };

  const loop = async (
    breakingCondition: (index: number) => boolean,
    callback: FullFunctionWithIndex,
    options?: ActionCustomData,
  ): Promise<void> => {
    const index = await $a(
      () => promiseLoop(callback, breakingCondition),
      options,
    );

    log({
      category: "SESSION",
      type: "INFO",
      name: "Loop ends",
      message: index
        ? `Loop '${options?.name}' - Fulfilled at index '${index}'`
        : `Loop '${options?.name}' - Interrupted`,
    });
  };

  const afterAll = (callback: FullFunctionWithApp): void => {
    state.afterAllEffects.push(callback);
  };

  const options = {
    run,
    end,
    loop,
    afterAll,
  };

  return options;
};

export default useSession;
