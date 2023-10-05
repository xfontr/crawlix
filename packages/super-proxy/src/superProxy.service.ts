import {
  SuperProxyCustomMethods,
  SuperProxyStore,
  SuperProxyOptions,
  SuperProxyPlugin,
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
        store.plugins.publicActions[moduleName] = (...args: unknown[]) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          module.action(store, ...args);
      }

      if (!module.run) return;

      if (module.run === "BEFORE_AFTER") {
        store.plugins.after.push(module.action);
        store.plugins.before.push(module.action);
        return;
      }

      store.plugins.init =
        module.run === "INIT"
          ? [...store.plugins.init, module.action]
          : store.plugins.init;

      store.plugins.after =
        module.run === "AFTER"
          ? [...store.plugins.after, module.action]
          : store.plugins.after;

      store.plugins.before =
        module.run === "BEFORE"
          ? [...store.plugins.before, module.action]
          : store.plugins.before;

      store.plugins.cleanUp =
        module.run === "CLEANUP"
          ? [...store.plugins.cleanUp, module.action]
          : store.plugins.cleanUp;
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

  const getters = () =>
    Object.keys(store.current).reduce(
      (allGetters, getterName) => ({
        ...allGetters,
        [`get${capitalize(getterName)}`]: () =>
          store.current[getterName as keyof typeof store.current],
      }),
      {} as Record<
        `get${Capitalize<keyof typeof store.current>}`,
        () => string | undefined
      >,
    );

  const setters = () =>
    Object.keys(store.current).reduce(
      (allSetters, rawSetterName) => {
        const setterName = rawSetterName as keyof typeof store.current;
        return {
          ...allSetters,
          [`set${capitalize(setterName)}`]: (value: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            store.current[setterName] = value as any;
          },
        };
      },
      {} as Record<
        `set${Capitalize<keyof typeof store.current>}`,
        (value?: string) => void
      >,
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
