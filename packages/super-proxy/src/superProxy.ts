import superProxyStore from "./superProxy.service";
import {
  SuperProxyAdditionalArguments,
  SuperProxiedFunction,
  SuperProxyCustomMethods,
  SuperProxyOptions,
} from "./superProxy.types";

const superProxy =
  <
    A extends object,
    C extends SuperProxyCustomMethods<T>,
    K extends boolean,
    P extends string[] = string[],
    T extends Record<string, any> = Record<string, any>,
  >(
    baseOptions: SuperProxyOptions<T, C, A>,
  ) =>
  (
    additionalArguments: SuperProxyAdditionalArguments<A>,
  ): SuperProxiedFunction<T, C, K, P> => {
    const {
      private: { store: privateStore, proxiedAction },
      public: publicStore,
    } = superProxyStore(baseOptions, { additionalArguments });

    privateStore.options.actions?.init?.(privateStore);
    privateStore.plugins.init.forEach((action) => {
      action(privateStore);
    });

    const defaultProxiedFunction = {
      superProxyStore: publicStore.storeActions,
      superProxyPlugins: publicStore.plugins,
      superProxyTerminate: (...args: unknown[]) => {
        privateStore.options.actions?.cleanUp?.(privateStore, ...args);
        privateStore.plugins.cleanUp.forEach((action) => {
          action(privateStore, ...args);
        });
      },
      ...(privateStore.options.keepOriginal
        ? privateStore.options.proxiedItem
        : {}),
    };

    return privateStore.options.customMethods.reduce(
      (allMethods, [oldName, newName]) => ({
        ...allMethods,
        [newName]: (...args: unknown[]) => {
          privateStore.current.method = newName;
          proxiedAction(privateStore.options.proxiedItem[oldName], ...args);
        },
      }),
      defaultProxiedFunction as unknown as SuperProxiedFunction<T, C, K, P>,
    );
  };

export default superProxy;
