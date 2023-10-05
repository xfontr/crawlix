import { superProxy } from "@super-proxy/core";
import { AnalyticsPluginActions, analyticsPlugin } from "@super-proxy/modules";
import { readdir, unlink } from "fs";
import { join } from "path";
import { ANALYTICS_PATH } from "./constants";

interface AdditionalArguments {
  current: string;
}

type PublicActions = [...AnalyticsPluginActions, "printHistory"];

const path = join(__dirname, ANALYTICS_PATH);

const logger = superProxy<
  AdditionalArguments,
  [["log", "speak"], ["error", "error"]], // [original_object_key, new_key] - Only these methods will be proxied
  true, // Allows access to the original object methods and attributes
  PublicActions,
  typeof console
>({
  proxiedItem: console,
  customMethods: [
    ["log", "speak"],
    ["error", "error"],
  ],
  keepOriginal: true,
  actions: {
    before: ({ additionalArguments }, ...args: string[]) => [
      `${additionalArguments!.current}:`,
      ...args,
    ],
    cleanUp: () => {
      readdir(path, (_, files) => {
        unlink(
          join(path, files.at(-1) ?? ""),
          () => undefined,
        );
      });
    },
  },
  plugins: [
    analyticsPlugin({
      path,
      throwError: true,
    }),
  ],
});

export default logger;

