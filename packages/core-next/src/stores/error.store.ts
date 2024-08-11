import type { CustomError, CustomErrorData, ErrorStore } from "../types";
import createStore from "../utils/stores";
import { generateId, stringifyWithKeys } from "../utils/utils";
import useActionStore from "./action.store";
import useLocationStore from "./location.store";
import useLogStore from "./log.store";
import useRuntimeConfigStore from "./runtimeConfig.store";

const logCriticalityMap: Record<Required<CustomError>["criticality"], number> =
  {
    FATAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

const useErrorStore = createStore(
  "error",
  { totalErrors: 0, errorLog: [] } as ErrorStore,
  (state) => {
    const pushError = (error?: CustomErrorData, forceLog?: boolean) => {
      const { getCurrentLocation, logLocationError } = useLocationStore();
      const { depth } = useActionStore().current.action;
      const { fatalErrorDepth, logging } = useRuntimeConfigStore().current;

      state.totalErrors += 1;
      const id = generateId();
      const criticality =
        depth <= fatalErrorDepth ? "FATAL" : error?.criticality;

      state.errorLog.push({
        id,
        index: state.totalErrors,
        ...error,
        ...(criticality ? { criticality } : {}),
        location: getCurrentLocation(),
      });

      logLocationError(id);

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (forceLog || logging.logErrors)
        useLogStore().pushLog({
          name: `[${criticality} ERROR] ${error?.name}`,
          message: stringifyWithKeys({
            id,
            message: error?.message,
            stack: error?.stack,
          }),
          type: "ERROR",
          ...(criticality
            ? { criticality: logCriticalityMap[criticality] }
            : {}),
        });
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
