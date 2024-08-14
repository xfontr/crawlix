import actionStore from "./action.store";
import errorStore from "./error.store";
import itemStore from "./item.store";
import locationStore from "./location.store";
import logStore from "./log.store";
import runtimeConfigStore from "./runtimeConfig.store";
import sessionStore from "./session.store";

const useActionStore = actionStore.private;
const useErrorStore = errorStore.private;
const useItemStore = itemStore.private;
const useLocationStore = locationStore.private;
const useLogStore = logStore.private;
const useRuntimeConfigStore = runtimeConfigStore.private;
const useSessionStore = sessionStore.private;

export {
  useActionStore,
  useErrorStore,
  useItemStore,
  useLocationStore,
  useLogStore,
  useRuntimeConfigStore,
  useSessionStore,
};
