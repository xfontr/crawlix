import { SuperProxyCustomMethods, SuperProxyPlugin } from "@super-proxy/core";

export interface SuperProxyPrivateModuleOptions<
  S extends Record<string, unknown> = Record<string, unknown>,
> {
  pluginStore?: S;
  storeKey?: keyof S;
}

export interface SuperProxyBaseModuleOptions<
  T extends object = object,
  C extends SuperProxyCustomMethods<T> = SuperProxyCustomMethods<T>,
> {
  run?: SuperProxyPlugin<T, C>["modules"][string]["run"];
  isPublic?: boolean;
}
