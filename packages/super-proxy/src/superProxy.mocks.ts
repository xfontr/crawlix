import { superProxyStore } from "..";
import { superProxyStoreInitialState } from "./superProxy.utils";

export const mockProxiedItem: object = {};

export const mockSuperProxyBasicStore: Omit<ReturnType<
  typeof superProxyStore<object, []>
>, "public"> = {
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
};
