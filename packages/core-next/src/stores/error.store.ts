import { CustomError, CustomErrorData } from "../types/Error.type";
import { ErrorStore } from "../types/Store.type";
import { clone, generateId } from "../utils/utils";
import useActionStore from "./action.store";
import useLocationStore from "./location.store";
import useRuntimeConfigStore from "./runtimeConfig.store";

const state: ErrorStore = { totalErrors: 0, errorLog: [] };

const useErrorStore = () => {
  const pushError = (error?: CustomErrorData) => {
    const { getCurrentLocation, logLocationError } = useLocationStore();
    const { depth } = useActionStore().getAction();
    const { fatalErrorDepth } = useRuntimeConfigStore().getRuntimeConfig();

    state.totalErrors += 1;
    const id = generateId();

    state.errorLog.push({
      id,
      index: state.totalErrors,
      ...error,
      criticality:
        depth <= fatalErrorDepth ? "FATAL" : error?.criticality ?? "UNKNOWN",
      location: getCurrentLocation(),
    });

    logLocationError(id);
  };

  const getLastError = <Exists extends boolean = false>() => {
    const lastError = state.errorLog.at(-1);
    return (lastError ? clone(lastError) : undefined) as Exists extends true
      ? CustomError
      : CustomError | undefined;
  };

  const output = (): ErrorStore => clone(state);

  return { pushError, output, getLastError };
};

export default useErrorStore;
