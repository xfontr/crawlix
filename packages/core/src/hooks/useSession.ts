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
import { runAfterAllInSeq, promiseLoop, actionNameToOptions } from "../utils";
import { useAction, useError, useLog } from ".";
import { MAX_LOOP_ITERATIONS } from "../configs/constants";
import {
  BreakingCondition,
  LoopOptions,
  SimpleLoopOptions,
} from "../utils/promises";

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

    await $a("Executing after all effects", () =>
      runAfterAllInSeq(
        outputStores(
          config.public.model,
          config.public.output.include,
          config.public.output.flatten,
        ),
        ...state.afterAllEffects,
      ),
    );

    state.afterAllEffects = [];

    EventBus.sessionCleanUp.emit();
  };

  const loopOptionsKeys = Object.keys({
    breakingCondition: 0,
    errorMaxIterationCount: 0,
  });

  const isLoopOptions = (
    options: LoopOptions | ActionCustomData,
  ): options is LoopOptions & {
    breakingCondition: BreakingCondition;
  } => Object.keys(options).some((key) => loopOptionsKeys.includes(key));

  /**
   * TODO: This code is unreadable, needs clean up
   */
  const cleanUpOptions = (
    options: ActionCustomData | string | SimpleLoopOptions,
    loopOptions: SimpleLoopOptions | FullFunctionWithIndex,
    callback?: FullFunctionWithIndex,
  ) => {
    let actionOptions: ActionCustomData = {};
    let finalLoopOptions: LoopOptions & {
      breakingCondition: BreakingCondition;
    } = {
      breakingCondition: () => true,
    };
    let finalCallback: FullFunctionWithIndex | undefined = callback;

    // FIRST OPTIONS OBJECT
    if (typeof options === "string") {
      actionOptions = actionNameToOptions(options);
    } else if (typeof options === "function") {
      finalLoopOptions.breakingCondition = options;
    } else if (typeof options === "number") {
      finalLoopOptions.breakingCondition = (index: number) => index === options;
    } else if (isLoopOptions(options)) {
      finalLoopOptions = options;
    } else {
      actionOptions = options as ActionCustomData;
    }

    // SECOND OPTIONS OBJECT
    if (typeof loopOptions === "function") {
      finalCallback = loopOptions;
    } else if (typeof loopOptions === "number") {
      finalLoopOptions.breakingCondition = (index: number) =>
        index === loopOptions;
    } else if (typeof loopOptions.breakingCondition === "number") {
      finalLoopOptions.breakingCondition = (index: number) =>
        index === loopOptions.breakingCondition;
    } else {
      finalLoopOptions = loopOptions as typeof finalLoopOptions;
    }

    return {
      actionOptions,
      finalLoopOptions,
      finalCallback,
    };
  };

  const loop = async (
    options: ActionCustomData | string | SimpleLoopOptions,
    loopOptions: SimpleLoopOptions | FullFunctionWithIndex,
    callback?: FullFunctionWithIndex,
  ): Promise<void> => {
    const { actionOptions, finalLoopOptions, finalCallback } = cleanUpOptions(
      options,
      loopOptions,
      callback,
    );

    const index = await $a(actionOptions, () =>
      promiseLoop(
        finalCallback!,
        finalLoopOptions.breakingCondition,
        finalLoopOptions?.errorMaxIterationCount ?? MAX_LOOP_ITERATIONS,
      ),
    );

    log({
      category: "SESSION",
      type: "INFO",
      name: "Loop ends",
      message: index
        ? `Loop '${actionOptions?.name}' - Fulfilled at index '${index}'`
        : `Loop '${actionOptions?.name}' - Interrupted`,
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
