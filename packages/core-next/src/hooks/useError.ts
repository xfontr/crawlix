import { useActionStore, useErrorStore } from "../stores";
import type { CustomErrorData, Session } from "../types";
import EventBus from "../utils/EventBus";

const useError = () => {
  const createError = (
    error: CustomErrorData = {},
    forceLog?: boolean,
  ): void => {
    const { pushError, getLastError } = useErrorStore();
    const { depth } = useActionStore().current();

    pushError({ ...error }, forceLog);

    const { criticality, type } = getLastError<true>();

    if (criticality === "FATAL") {
      EventBus.emit(
        "SESSION:END",
        type === "TIMEOUT" ? "TIMED_OUT" : ("FATAL_ERROR" as Session["status"]),
      );
    }

    if (criticality !== "LOW") EventBus.emit("SESSION:BLOCK_ACTIONS", depth);
  };

  return { createError };
};

export default useError;
