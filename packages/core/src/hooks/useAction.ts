import { delay } from "../utils/promises";
import { randomize, tryCatch } from "../utils/utils";
import {
  useActionStore,
  useErrorStore,
  useRuntimeConfigStore,
} from "../stores";
import type { ActionCustomData, FullFunction } from "../types";
import { useError } from ".";
import { MAX_THREAD_DEPTH } from "../configs/constants";

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

const useAction = () => {
  const { initAction, current } = useActionStore();
  const {
    mockUserPause: { duration, variationRange },
  } = useRuntimeConfigStore().current.public;

  let depth = 0;

  const $a = async <T>(
    callback: FullFunction<T>,
    actionOptions: ActionCustomData & { log?: boolean } = {},
  ) => {
    if (depth > blockedThread) return;
    const { createError } = useError();

    const endTracking = trackActivity();
    setBlockedThread(MAX_THREAD_DEPTH);

    const mockUserPause = randomize(duration, variationRange);

    depth += 1;

    const { index } = current.action;

    const start = Date.now();

    const pushAction = initAction(
      {
        name: actionOptions?.name ?? "",
        depth,
        mockedDuration: mockUserPause,
      },
      !!actionOptions.log,
    );

    const [data, error] = await tryCatch(() => delay(callback, mockUserPause));

    const actionDuration = Date.now() - start;

    if (error) {
      createError({
        name: `[ACTION ERROR] index {'${index}'} depth {'${depth}'}`,
        message: `[${error?.name}] ${error?.message}`,
        stack: error?.stack,
        ...(actionOptions.isCritical ? { criticality: "FATAL" } : {}),
      });

      pushAction({
        errorId: useErrorStore().getLastError()?.id,
        duration: actionDuration,
      });
    } else {
      pushAction({ duration: actionDuration });
    }

    depth -= 1;
    endTracking();

    return data;
  };

  const setBlockedThread = (depth: number): void => {
    blockedThread = depth;
  };

  return { $a, setBlockedThread };
};

export default useAction;
