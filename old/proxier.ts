import proxierStore from "./proxier.store";
import {
  ProxiedFunction,
  ProxierComponent,
  ProxierCustomMethod,
  ProxierExtraArguments,
  ProxierOptions,
  ProxierTool,
} from "./proxier.types";
import {
  createLoggerStore,
  filterPlugins,
  getMethodName,
  resetCurrentStore,
  setPreferredOptions,
} from "./proxier.utils";

const proxier =
  <
    K extends boolean,
    T extends object,
    C extends ProxierCustomMethod<T>[],
    A extends object,
    E extends object,
  >(
    proxierTool: ProxierTool<T>,
    customMethods: C,
    baseOptions?: ProxierOptions<A>,
  ) =>
  (
    extraArguments?: ProxierExtraArguments<A>,
  ): ProxiedFunction<ProxierTool<T>, C, K, E> => {
    const store = createLoggerStore(proxierTool, customMethods);
    const options = setPreferredOptions(baseOptions);

    const plugins = options.plugins?.reduce<Record<string, ProxierComponent>>(
      (allPlugins, plugin) => ({
        ...allPlugins,
        ...plugin(store),
      }),
      {},
    );

    const { beforePlugins, afterPlugins } = filterPlugins(plugins);

    const extendedActions = plugins
      ? Object.entries(plugins).reduce(
          (allPlugins, [pluginName, plugin]) => ({
            ...allPlugins,
            ...(plugin.extendLoggerActions
              ? { [pluginName]: plugin.action }
              : {}),
          }),
          {},
        )
      : {};

    const defaultProxiedFunction = (
      options.keepOriginal
        ? { ...store.proxierTool, publicStore: proxierStore(store) }
        : { publicStore: proxierStore(store) }
    ) as ProxiedFunction<T, C, K, E>;

    return store.customMethods.reduce<ProxiedFunction<T, C, K, E>>(
      (allMethods, methodName) => {
        const { oldName, newName } = getMethodName(methodName);

        return store.proxierTool[oldName]
          ? {
              ...allMethods,
              [newName]: (
                ...args: Parameters<ProxierTool<T>[typeof oldName]>
              ) => {
                const message = args[0] as string;

                resetCurrentStore(store, message, oldName, newName);

                store.current.beforeResponse = options?.before?.(
                  store.current,
                  extraArguments,
                );
                beforePlugins.forEach(({ action }) => {
                  action(extraArguments);
                });

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                store.current.loggerResponse = store.proxierTool?.[oldName](
                  store.current.message,
                  ...args.slice(1),
                );

                store.current.afterResponse = options?.after?.(
                  store.current,
                  extraArguments,
                );
                afterPlugins.forEach(({ action }) => {
                  action(extraArguments);
                });

                return options?.publicResponse
                  ? store.current.message
                  : undefined;
              },
              ...(extendedActions ?? {}),
            }
          : allMethods;
      },
      defaultProxiedFunction,
    );
  };

export default proxier;
