import {
  useActionStore,
  useErrorStore,
  useRuntimeConfigStore,
} from "../stores";
import type {
  ActionAsyncData,
  ActionCustomData,
  CustomError,
  FullFunction,
} from "../types";
import { useError } from ".";
import { MAX_THREAD_DEPTH } from "../configs/constants";
import { randomize, tryCatch, delay } from "../utils";

let blockedThread = MAX_THREAD_DEPTH;

const actionStack = new Set<symbol>();

const trackActivity = () => {
  let key: symbol | undefined = Symbol("action");
  actionStack.add(key);

  return () => {
    actionStack.delete(key!);
    key = undefined; // GC

    let emptyStackTimeout;

    if (!actionStack.size) {
      const { limit } = useRuntimeConfigStore().current.public;

      emptyStackTimeout = setTimeout(() => {
        if (actionStack.size) return;

        actionStack.clear();

        useError().createError({
          name: "INACTIVITY",
          message: `No activity detected for the last ${limit.inactivity}ms`,
          criticality: "FATAL",
          type: "INTERNAL",
        });
      }, limit.inactivity);
    }

    if (actionStack.size && emptyStackTimeout) clearTimeout(emptyStackTimeout);
  };
};

const cleanOptions = <T>(
  options:
    | (ActionCustomData & { forceLog?: boolean })
    | string
    | FullFunction<T>,
) => {
  if (typeof options === "string") return { name: options };
  return typeof options === "function" ? {} : options;
};

const useAction = () => {
  const { initAction, current } = useActionStore();
  const {
    mockUserPause: { duration, variationRange },
  } = useRuntimeConfigStore().current.public;

  let depth = 0;

  const createError = (
    error: Error | undefined,
    options: ActionCustomData,
  ): CustomError | undefined => {
    if (!error) return;

    useError().createError({
      name: `[ACTION ERROR] index {'${current.currentRef.index}'} depth {'${depth}'}`,
      message: `[${error?.name}] ${error?.message}`,
      ...(error?.stack ? { stack: error?.stack } : {}),
      ...(options.isCritical ? { criticality: "FATAL" } : {}),
    });

    return useErrorStore().getLastError()!;
  };

  const $a = async <T>(
    options:
      | (ActionCustomData & { forceLog?: boolean })
      | string
      | FullFunction<T>,
    callback?: FullFunction<T>,
  ) => {
    if (typeof options === "function") callback = options;
    options = cleanOptions(options);

    if (depth > blockedThread) return;

    const endTracking = trackActivity();
    setBlockedThread(MAX_THREAD_DEPTH);

    const mockUserPause = randomize(duration, variationRange);

    depth += 1;

    const start = Date.now();

    const pushAction = initAction(
      {
        name: options?.name ?? "",
        depth,
        mockedDuration: mockUserPause,
      },
      !!options.forceLog,
    );

    const [data, error] = await tryCatch(() => delay(callback!, mockUserPause));

    const asyncAction: ActionAsyncData & { error?: CustomError } = {
      duration: Date.now() - start,
    };

    const hasLastError = createError(error, options);
    if (hasLastError) asyncAction.error = hasLastError;

    pushAction(asyncAction);
    endTracking();
    depth -= 1;

    return data;
  };

  const setBlockedThread = (depth: number): void => {
    blockedThread = depth;
  };

  return { $a, setBlockedThread };
};

export default useAction;
