import { SuperProxyCustomMethods, SuperProxyPlugin, SuperProxyStore } from "..";

export const capitalize = (text?: string) =>
  `${text?.[0]?.toUpperCase() ?? ""}${text?.slice(1) ?? ""}`;

export const superProxyStoreInitialState = <
  T extends object,
  C extends SuperProxyCustomMethods<T>,
  A extends object = Record<string, unknown>,
  P extends SuperProxyPlugin<T, C>[] = SuperProxyPlugin<T, C>[],
>(): {
  current: SuperProxyStore<T, C, A, P>["current"];
  plugins: SuperProxyStore<T, C, A, P>["plugins"];
} => ({
  plugins: {
    init: [],
    before: [],
    after: [],
    cleanUp: [],
    publicActions: {},
  },
  current: {
    before: undefined,
    main: undefined,
    after: undefined,
    method: undefined,
  },
});
