import {
  SuperProxyCustomMethods,
  SuperProxyStore,
  SuperProxyOptions,
  SuperProxyPlugin,
  PublicStoreGetters,
  PublicStoreSetters,
} from "./superProxy.types";
import { capitalize, superProxyStoreInitialState } from "./superProxy.utils";

const superProxyStore = <
  T extends object,
  C extends SuperProxyCustomMethods<T>,
  A extends object = Record<string, unknown>,
  P extends SuperProxyPlugin<T, C>[] = SuperProxyPlugin<T, C>[],
>(
  baseOptions: SuperProxyOptions<T, C, A, P>,
  defaultValues: Partial<SuperProxyStore<T, C, A>> = {},
) => {
  const store: SuperProxyStore<T, C, A, P> = {
    customMethods: baseOptions.customMethods,
    additionalArguments: defaultValues.additionalArguments,
    options: baseOptions,
    ...superProxyStoreInitialState(),
  };

  store.options.plugins?.forEach((plugin) => {
    Object.entries(plugin.modules).forEach(([moduleName, module]) => {
      if (module.isPublic) {
        store.plugins.publicActions[moduleName] = <T = unknown>(
          ...args: unknown[]
        ): T => module.action(store, ...args);
      }

      if (!module.run) return;

      if (module.run === "BEFORE_AFTER") {
        store.plugins.after.push(module.action);
        store.plugins.before.push(module.action);
        return;
      }

      const actions: (keyof NonNullable<
        SuperProxyOptions<T, C, object>["actions"]
      >)[] = ["init", "after", "before", "cleanUp"];

      actions.forEach((action) => {
        module.run === action.toUpperCase()
          ? [...store.plugins[action], module.action]
          : store.plugins[action];
      });
    });
  });

  const proxiedAction = (
    callback: <T>(...args: unknown[]) => T,
    ...args: unknown[]
  ) => {
    // BEFORE
    store.current.before = baseOptions.actions?.before?.(store, ...args);
    store.plugins.before.forEach((action) => {
      action?.(store, ...args);
    });

    // MAIN
    const processedArgs: unknown[] = Array.isArray(store.current.before)
      ? store.current.before
      : [store.current.before];
    store.current.main = callback(...processedArgs) ?? store.current.before;

    // AFTER
    store.current.after = baseOptions.actions?.after?.(store, ...args);
    store.plugins.after.forEach((action) => {
      action?.(store, ...args);
    });
  };

  const getters = (): PublicStoreGetters<T, C> =>
    Object.keys(store.current).reduce(
      (allGetters, getterName) => ({
        ...allGetters,
        [`get${capitalize(getterName)}`]: () =>
          store.current[getterName as keyof typeof store.current],
      }),
      {} as PublicStoreGetters<T, C>,
    );

  const setters = (): PublicStoreSetters<T, C> =>
    Object.keys(store.current).reduce(
      (allSetters, rawSetterName) => {
        const setterName = rawSetterName as keyof typeof store.current;
        return {
          ...allSetters,
          [`set${capitalize(setterName)}`]: (value: string) => {
            store.current[setterName] = value;
          },
        };
      },
      {} as PublicStoreSetters<T, C>,
    );

  return {
    private: {
      store,
      proxiedAction,
    },
    public: {
      storeActions: {
        ...getters(),
        ...setters(),
      },
      plugins: store.plugins.publicActions,
    },
  };
};

export default superProxyStore;
