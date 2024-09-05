import type { CustomError, CustomErrorData, ErrorStore } from "../types";
import { createStore } from "../helpers/stores";
import {
  useRuntimeConfigStore,
  useLogStore,
  useLocationStore,
  useActionStore,
  useItemStore,
} from ".";
import { useMeta } from "../hooks";

const criticalityMap = (
  base: number,
): Record<CustomError["criticality"], number> => ({
  FATAL: base,
  HIGH: base + 2,
  MEDIUM: base + 2,
  LOW: base + 2,
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

      if (
        actionDepth <= criticalityLevels.FATAL &&
        actionDepth >= criticalityLevels.HIGH
      )
        return "FATAL";

      if (
        actionDepth <= criticalityLevels.HIGH &&
        actionDepth >= criticalityLevels.MEDIUM
      )
        return "HIGH";

      return actionDepth <= criticalityLevels.MEDIUM &&
        actionDepth >= criticalityLevels.LOW
        ? "MEDIUM"
        : "LOW";
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
