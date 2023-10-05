import { SuperProxyCustomMethods, SuperProxyPlugin } from "@super-proxy/core";
import printFile, {
  SuperProxyPrintFilePublicModuleOptions,
} from "../modules/printFile.module";

export type AnalyticsPluginActions = ["getHistory", "getCounters"];

const analyticsPlugin = <
  T extends object,
  C extends SuperProxyCustomMethods<T>,
>(
  printFileOptions: SuperProxyPrintFilePublicModuleOptions,
): SuperProxyPlugin<T, C> => {
  const store = {
    history: [] as string[],
    usageCounter: {
      totalCount: 0,
    } as Record<string, number> & {
      totalCount: 0;
    },
  };

  return {
    name: "@super-proxy/analytics-plugin",
    version: "0.0.1",
    modules: {
      setup: {
        action: ({ customMethods }) => {
          store.usageCounter = customMethods?.reduce(
            (usageData, customMethod) => ({
              ...usageData,
              [customMethod[1] === "totalCount"
                ? `METHOD_${customMethod[1]}`
                : customMethod[1]]: 0,
            }),
            store.usageCounter,
          );
        },
        run: "INIT",
      },
      updateHistory: {
        action: ({ current: { main, method } }) => {
          const cleanMethod = (method === "totalCount"
            ? `METHOD_${method}`
            : method) as unknown as keyof typeof store.usageCounter;

          store.history.push(`${Date.now()} | ${(main as string[]).join(" ")}`);
          store.usageCounter.totalCount += 1;
          store.usageCounter[cleanMethod] += 1;
        },
        run: "AFTER",
      },
      getHistory: {
        action: (_, getLast: boolean) =>
          getLast ? store.history.at(-1) : store.history,
        isPublic: true,
      },
      getCounters: {
        action: () => store.usageCounter,
        isPublic: true,
      },
      printHistory: printFile({
        ...printFileOptions,
        pluginStore: store,
        storeKey: "history",
      }),
    },
  };
};

export default analyticsPlugin;
