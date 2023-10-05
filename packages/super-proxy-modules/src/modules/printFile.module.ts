import { SuperProxyCustomMethods, SuperProxyPlugin } from "@super-proxy/core";
import { writeFile } from "fs";
import { join } from "path";
import {
  SuperProxyBaseModuleOptions,
  SuperProxyPrivateModuleOptions,
} from "../modules.types";

export type SuperProxyPrintFilePublicModuleOptions = {
  throwError?: boolean;
  fileExtension?: string;
  path: string;
} & SuperProxyBaseModuleOptions;

type SuperProxyPrintFileModuleOptions<
  S extends Record<string, unknown> = Record<string, unknown>,
> = SuperProxyPrintFilePublicModuleOptions & SuperProxyPrivateModuleOptions<S>;

const printFile = <
  S extends Record<string, unknown> = Record<string, unknown>,
  T extends object = object,
  C extends SuperProxyCustomMethods<T> = SuperProxyCustomMethods<T>,
>(
  options: SuperProxyPrintFileModuleOptions<S>,
): SuperProxyPlugin<T, C>["modules"][string] => ({
  action: (_, throwError = false) => {
    writeFile(
      join(
        options.path,
        `${Date.now().toString()}.${options.fileExtension ?? "txt"}`,
      ),
      JSON.stringify(options.pluginStore?.[options?.storeKey ?? ""] ?? {}),
      (error) => {
        if (error && throwError) {
          throw new Error(error.message);
        }
      },
    );
  },
  run: options.run ?? "CLEANUP",
  isPublic: !!options.isPublic,
});

export default printFile;
