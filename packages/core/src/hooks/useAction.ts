import { delay } from "../utils/promises";
import { randomize, tryCatch } from "../utils/utils";
import {
  useActionStore,
  useErrorStore,
  useRuntimeConfigStore,
} from "../stores";
import type { ActionCustomData, FullFunction } from "../types";
import { useError } from ".";

/**
 * TODO: All of this needs to be carefully tested
 */
const MAX_THREAD_DEPTH = 50;

let blockedThread = MAX_THREAD_DEPTH;

const actionStack = new Set<symbol>();

const useAction = () => {
  const { initAction, current } = useActionStore();
  const {
    mockUserPause: { duration, variationRange },
    limit: { inactivityTimeout },
  } = useRuntimeConfigStore().current.public;

  let depth = 0;

  const $a = async <T>(
    callback: FullFunction<T>,
    actionOptions: ActionCustomData & { forceLog?: boolean } = {},
  ) => {
    if (depth > blockedThread) return;
    const key = Symbol("action");
    const { createError } = useError();
    actionStack.add(key);

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
      !!actionOptions.forceLog,
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
    actionStack.delete(key);

    let emptyStackTimeout;

    if (!actionStack.size) {
      emptyStackTimeout = setTimeout(() => {
        if (!actionStack.size) {
          actionStack.clear();
          createError({
            name: "INACTIVITY",
            message: `No activity detected for the last ${inactivityTimeout}ms`,
            criticality: "FATAL",
            type: "INTERNAL",
          });
        }
      }, 3_000);
    } else if (emptyStackTimeout) {
      clearTimeout(emptyStackTimeout);
    }

    return data;
  };

  const setBlockedThread = (depth: number): void => {
    blockedThread = depth;
  };

  return { $a, setBlockedThread };
};

export default useAction;
