import { superProxyStore } from "..";
import { superProxyStoreInitialState } from "./superProxy.utils";

/**
 * Simple empty object
 */
export const mockProxiedItem: object = {};

/**
 * At least the first letter is going to be in caps
 */
export const mockText: `${Uppercase<string>}${string}` = "Some text";

export const mockSuperProxyStore = (): Omit<
  ReturnType<typeof superProxyStore<object, []>>,
  "public"
> => ({
  private: {
    store: {
      customMethods: [],
      additionalArguments: undefined,
      options: {
        customMethods: [],
        keepOriginal: false,
        proxiedItem: mockProxiedItem,
      },
      ...superProxyStoreInitialState(),
    },
    proxiedAction: () => mockProxiedItem,
  },
});

export const mockReturnedSuperProxyStore = () => superProxyStore({
  customMethods: [],
  keepOriginal: false,
  proxiedItem: mockProxiedItem,
});
