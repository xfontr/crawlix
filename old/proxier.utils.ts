import {
  ProxierOptions,
  ProxierComponent,
  ProxierStore,
  ProxierTool,
  ProxierPlugin,
  ProxierCustomMethod,
  ProxierPluginStore,
} from "./proxier.types";

export const newPlugin =
  <T extends object, S extends object = object>(
    key: keyof T,
    value: ProxierPluginStore<T, S>[typeof key],
    plugin: ProxierPlugin<T, S>,
  ) =>
  (store: ProxierPluginStore<T, S>) => {
    if (store[key]) {
      throw new Error("Conflicting plugins!");
    }

    store[key] = value;

    return plugin(store);
  };

export const resetCurrentStore = <T extends object>(
  { current }: ProxierStore<T>,
  message: ProxierStore<T>["current"]["message"],
  oldMethodName: ProxierStore<T>["current"]["oldMethodName"],
  newMethodName: ProxierStore<T>["current"]["newMethodName"],
): void => {
  current.message = message;
  current.oldMethodName = oldMethodName;
  current.newMethodName = newMethodName;
  current.loggerResponse = undefined;
  current.beforeResponse = undefined;
  current.afterResponse = undefined;
};

export const createLoggerStore = <T extends object>(
  proxierTool: ProxierTool<T>,
  customMethods: ProxierCustomMethod<T>[],
): ProxierStore<T> => ({
  proxierTool,
  customMethods,
  current: {
    message: undefined,
    oldMethodName: undefined,
    newMethodName: undefined,
    loggerResponse: undefined,
    beforeResponse: undefined,
    afterResponse: undefined,
  },
});

export const setPreferredOptions = <P extends object = object>(
  options?: ProxierOptions<P>,
): ProxierOptions<P> => ({
  publicResponse: true,
  keepOriginal: true,
  ...options,
});

export const filterPlugins = (plugins?: Record<string, ProxierComponent>) =>
  Object.values(plugins ?? {}).reduce(
    (allPlugins, currentPlugin) => ({
      beforePlugins:
        currentPlugin.launchAt === "before" ||
        currentPlugin.launchAt === "always"
          ? [...allPlugins.beforePlugins, currentPlugin]
          : allPlugins.beforePlugins,
      afterPlugins:
        currentPlugin.launchAt === "after" ||
        currentPlugin.launchAt === "always"
          ? [...allPlugins.afterPlugins, currentPlugin]
          : allPlugins.afterPlugins,
    }),
    { beforePlugins: [], afterPlugins: [] } as {
      beforePlugins: ProxierComponent[];
      afterPlugins: ProxierComponent[];
    },
  );

export const getMethodName = <T extends object>(
  methodName: ProxierCustomMethod<T>,
) => ({
  oldName: methodName[0],
  newName: methodName[1] as keyof T,
});

export const capitalize = (text?: string) =>
  `${text?.[0]?.toUpperCase() ?? ""}${text?.slice(1) ?? ""}`;
