import { writeFile } from "fs";
import { SuperProxyCustomMethods, SuperProxyPlugin } from "../superProxy.types";
import path from "path";

export type AnalyticsPluginActions = ["getHistory", "getCounters"];

const analyticsPlugin = <
  T extends object,
  C extends SuperProxyCustomMethods<T>,
>(
  run: "AFTER" | "BEFORE" | "BEFORE_AFTER" = "AFTER",
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
    name: "history-plugin",
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
        run,
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
      printHistory: {
        action: (_, throwError = false) => {
          writeFile(
            path.join(
              __dirname,
              "../../public/history/",
              `${Date.now().toString()}.txt`,
            ),
            JSON.stringify(store.history),
            (error) => {
              if (error && throwError) {
                throw new Error(error.message);
              }
            },
          );
        },
        run: "CLOSEUP",
      },
    },
  };
};

export default analyticsPlugin;
