import type { CustomError, CustomErrorData, ErrorStore } from "../types";
import { createStore } from "../helpers";
import {
  useRuntimeConfigStore,
  useLogStore,
  useLocationStore,
  useActionStore,
  useItemStore,
} from ".";
import { useMeta } from "../hooks";

const CRITICALITY_INCREASE = 2;

const criticalityMap = (
  base: number,
): Record<CustomError["criticality"], number> => ({
  FATAL: base,
  HIGH: base + CRITICALITY_INCREASE,
  MEDIUM: base + CRITICALITY_INCREASE * 2,
  LOW: base + CRITICALITY_INCREASE * 3,
});

const useErrorStore = createStore(
  "error",
  { totalErrors: 0, errorLog: [] } as ErrorStore,
  (state) => {
    const getCriticality = (
      error?: CustomErrorData,
    ): CustomError["criticality"] => {
      if (error?.criticality) return error.criticality;

      const { depth: actionDepth } = useActionStore().current.currentRef;
      const { fatalErrorDepth } = useRuntimeConfigStore().current.public;

      const criticalityLevels = criticalityMap(fatalErrorDepth);

      if (actionDepth <= criticalityLevels.FATAL) return "FATAL";
      if (actionDepth <= criticalityLevels.HIGH) return "HIGH";
      return actionDepth <= criticalityLevels.MEDIUM ? "MEDIUM" : "LOW";
    };

    const pushError = (error: CustomErrorData, log?: boolean) => {
      state.totalErrors += 1;

      const customError: CustomError = {
        ...useMeta().get(state.totalErrors),
        ...error,
        criticality: getCriticality(error),
      };

      state.errorLog.push(customError);

      useLocationStore().logLocationError(customError);
      useItemStore().logItemError(customError);
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
