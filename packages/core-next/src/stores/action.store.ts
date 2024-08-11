import type {
  ActionAsyncData,
  ActionData,
  ActionStore,
  ActionSyncInstance,
} from "../types";
import createStore from "../utils/stores";
import { generateId, stringifyWithKeys } from "../utils/utils";
import useLocationStore from "./location.store";
import useLogStore from "./log.store";
import useRuntimeConfigStore from "./runtimeConfig.store";
import useSessionStore from "./session.store";

const useActionStore = createStore(
  "action",
  {
    totalActions: 0,
    totalMockedPausesDuration: 0,
    actionLog: [],
    action: {} as ActionSyncInstance,
  } as ActionStore,
  (state) => {
    const initAction = (action: ActionData, forceLog?: boolean) => {
      let _tempSyncAction: ActionSyncInstance | undefined = undefined;

      const { logging } = useRuntimeConfigStore().current;

      if (useSessionStore().isIDLE()) {
        throw new Error(
          "Cannot execute actions before initializing the session",
        );
      }

      state.totalActions += 1;
      state.totalMockedPausesDuration += action.mockedDuration ?? 0;

      const id = generateId();

      _tempSyncAction = {
        index: state.totalActions,
        location: useLocationStore().getCurrentLocation(),
        id,
        ...action,
      };

      state.action = _tempSyncAction;

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (forceLog || action.depth <= logging.actionsDepth) {
        useLogStore().pushLog({
          name: action.name
            ? `[ACTION #${state.totalActions}] - ${action.name}`
            : `[ACTION #${state.totalActions}]`,
          message: stringifyWithKeys({
            id,
            depth: action.depth,
            mocked_duration: action.mockedDuration,
          }),
          type: "INFO",
          // We add +1 to make sure that an action will never have the same criticality as a fatal error
          criticality: action.depth + 1,
        });
      }

      return (asyncAction: ActionAsyncData): void => {
        state.actionLog.push({
          ..._tempSyncAction!,
          ...asyncAction,
        });
      };
    };

    return { initAction };
  },
);

export default useActionStore;
