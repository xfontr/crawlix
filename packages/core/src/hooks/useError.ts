import { useActionStore, useErrorStore } from "../stores";
import type { CustomErrorData, Session } from "../types";
import EventBus from "../utils/EventBus";

const useError = () => {
  const createError = (error: CustomErrorData = {}, log?: boolean): void => {
    const { pushError, getLastError } = useErrorStore();
    const { depth } = useActionStore().current.currentRef;

    pushError({ ...error }, log);

    const { criticality, type } = getLastError<true>();

    if (criticality === "FATAL") {
      EventBus.endSession.emit(
        type === "TIMEOUT" ? "TIMED_OUT" : ("FATAL_ERROR" as Session["status"]),
      );
    }

    if (criticality !== "LOW") EventBus.blockActions.emit(depth);
  };

  return { createError };
};

export default useError;
