import type { Action } from "../types/Action.type";
import useSessionStore from "./session.store";

const state: Action = { depth: 0, index: 0 };

const useActionStore = () => {
  const pushAction = (depth: Action["depth"]): void => {
    if (!useSessionStore().isInProgress()) {
      throw new Error("Cannot execute actions before initializing the session");
    }

    state.depth = depth ?? state.depth;
    state.index += 1;
  };

  const getAction = (): Action => ({ ...state });

  return {
    pushAction,
    getAction,
  };
};

export default useActionStore;
