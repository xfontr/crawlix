import analyticsPlugin, { AnalyticsPluginActions } from "./plugins/analytics";
import superProxy from "./superProxy";

const logger = superProxy<
  { current: string },
  [["log", "speak"], ["error", "error"]],
  true,
  AnalyticsPluginActions
>({
  proxiedItem: console,
  customMethods: [["log", "speak"], ["error", "error"]],
  keepOriginal: false,
  actions: {
    before: ({ additionalArguments }, ...args: string[]) => [
      `${additionalArguments!.current}:`,
      ...args,
    ],
  },
  plugins: [analyticsPlugin()],
});

logger({ current: "HOME" });