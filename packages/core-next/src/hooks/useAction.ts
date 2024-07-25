import useActionStore from "../stores/action.store";
import useLogStore from "../stores/log.store";
import type { LogData } from "../types/Log.type";
import type { ActionFullFunction } from "../types/Object.type";
import { tryCatch } from "../utils/utils";
import useError from "./useError";

const MAX_THREAD_DEPTH = 50;

// Update this with event bus
let blockedThread = MAX_THREAD_DEPTH;

const useAction = () => {
  const { pushLog } = useLogStore();
  const { pushAction, getAction } = useActionStore();
  let depth = 0;

  const $a = async <T>(
    callback: ActionFullFunction<T>,
    logOptions?: LogData,
  ) => {
    if (depth > blockedThread) {
      return;
    }

    setBlockedThread(MAX_THREAD_DEPTH);

    depth += 1;
    pushAction(depth);
    const { index } = getAction();

    const [data, error] = await tryCatch(callback, depth, index, blockedThread);

    if (error) {
      useError().createError({
        name: `[ACTION ERROR] index {'${index}'} depth {'${depth}'}`,
        message: `[${error?.name}] ${error?.message}`,
        stack: error?.stack,
      });
    }

    depth -= 1;

    if (logOptions) {
      pushLog({
        ...logOptions,
        name: logOptions?.name
          ? `[ACTION] ${index} - ${logOptions.name}`
          : `[ACTION] ${index}`,
      });
    }

    return data;
  };

  const setBlockedThread = (depth: number): void => {
    blockedThread = depth;
  };

  return { $a, setBlockedThread };
};

export default useAction;
