import { getMethodName, newPlugin } from "../proxier.utils";

interface UsageDataStore {
  usageCounter: {
    total: number;
  } & Record<string, string | number | boolean>;
}

export interface UsageDataPublicActions {
  getUsageData: () => UsageDataStore["usageCounter"];
}

const usageDataPlugin = newPlugin<UsageDataStore>(
  "usageCounter",
  { total: 0 },
  (store) => {
    store.usageCounter = store.customMethods?.reduce(
      (usageData, customMethod) => ({
        ...usageData,
        [getMethodName(customMethod).oldName]: 0,
      }),
      { total: 0 },
    ) ?? { total: 0 };

    return {
      countUp: {
        action: () => {
          store.usageCounter.total += 1;

          if (!store.current.newMethodName) {
            return;
          }

          const currentCount = store.usageCounter[
            store.current.newMethodName
          ] as number | undefined;
          store.usageCounter[store.current.newMethodName] = currentCount
            ? currentCount + 1
            : 1;
        },
        launchAt: "after",
        extendLoggerActions: false,
      },
      getUsageData: {
        action: () => store.usageCounter,
        extendLoggerActions: true,
      },
    };
  },
);

export default usageDataPlugin;
