import type { CustomError, CustomErrorData, ErrorStore } from "../types";
import { createStore } from "../utils/stores";
import { generateId } from "../utils/utils";
import {
  useRuntimeConfigStore,
  useLogStore,
  useLocationStore,
  useActionStore,
} from ".";

const useErrorStore = createStore(
  "error",
  { totalErrors: 0, errorLog: [] } as ErrorStore,
  (state) => {
    const pushError = (error?: CustomErrorData, log?: boolean) => {
      const { getCurrentLocation, logLocationError } = useLocationStore();
      const { depth } = useActionStore().current.action;
      const { fatalErrorDepth } = useRuntimeConfigStore().current.public;

      state.totalErrors += 1;
      const criticality =
        depth <= fatalErrorDepth ? "FATAL" : error?.criticality;

      const customError: CustomError = {
        id: generateId(),
        index: state.totalErrors,
        ...error,
        ...(criticality ? { criticality } : {}),
        location: getCurrentLocation(),
      };

      state.errorLog.push(customError);

      logLocationError(customError.id);

      useLogStore().logError(customError, log);
    };

    const getLastError = <Exists extends boolean = false>() => {
      const lastError = state.errorLog.at(-1);
      return (
        lastError ? structuredClone(lastError) : undefined
      ) as Exists extends true ? CustomError : CustomError | undefined;
    };

    return { pushError, getLastError };
  },
);

export default useErrorStore;