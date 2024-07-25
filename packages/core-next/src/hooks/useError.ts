import useActionStore from "../stores/action.store";
import useErrorStore from "../stores/error.store";
import useLogStore from "../stores/log.store";
import { CustomErrorData } from "../types/Error.type";
import { Session } from "../types/Session.type";
import EventBus from "../utils/EventBus";

const useError = () => {
  const createError = (error: CustomErrorData = {}): void => {
    const { pushError, getLastError } = useErrorStore();
    const { depth } = useActionStore().getAction();

    pushError({ ...error });

    const { criticality, id } = getLastError<true>();

    useLogStore().pushLog({
      name: `${criticality} ERROR`,
      message: id,
      type: "ERROR",
    });

    if (criticality === "FATAL") {
      EventBus.emit("SESSION:END", "FATAL_ERROR" as Session["status"]);
    }

    if (criticality !== "MILD") EventBus.emit("SESSION:BLOCK_ACTIONS", depth);
  };

  return { createError };
};

export default useError;
