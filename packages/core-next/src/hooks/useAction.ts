import { delay } from "../utils/promises";
import { randomize, tryCatch } from "../utils/utils";
import {
  useActionStore,
  useErrorStore,
  useRuntimeConfigStore,
} from "../stores";
import type { ActionCustomData, FullFunction } from "../types";
import useError from "./useError";

const MAX_THREAD_DEPTH = 50;

// Update this with event bus
let blockedThread = MAX_THREAD_DEPTH;

const useAction = () => {
  const { initAction, current } = useActionStore();
  const { configs } = useRuntimeConfigStore();
  let depth = 0;

  const $a = async <T>(
    callback: FullFunction<T>,
    actionOptions: ActionCustomData & { forceLog?: boolean } = {},
  ) => {
    if (depth > blockedThread) {
      return;
    }
    const {
      mockUserPause: { duration, variationRange },
    } = configs();
    setBlockedThread(MAX_THREAD_DEPTH);

    const mockUserPause = randomize(duration, variationRange);

    depth += 1;

    const { index } = current();

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

    pushAction({
      errorId: useErrorStore().getLastError()?.id,
      duration: Date.now() - start,
    });

    if (error) {
      useError().createError({
        name: `[ACTION ERROR] index {'${index}'} depth {'${depth}'}`,
        message: `[${error?.name}] ${error?.message}`,
        stack: error?.stack,
      });
    }

    depth -= 1;

    return data;
  };

  const setBlockedThread = (depth: number): void => {
    blockedThread = depth;
  };

  return { $a, setBlockedThread };
};

export default useAction;
