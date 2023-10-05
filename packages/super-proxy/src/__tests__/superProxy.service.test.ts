import { mockProxiedItem, mockSuperProxyBasicStore } from "../superProxy.mocks";
import superProxyStore from "../superProxy.service";

describe("Given a suerProxyService function", () => {
  describe("When called with the minimum parameters", () => {
    test("Should return a correct full private store", () => {
      const result = superProxyStore({
        customMethods: [],
        keepOriginal: false,
        proxiedItem: mockProxiedItem,
      });

      expect(JSON.stringify(result.private)).toBe(
        JSON.stringify(mockSuperProxyBasicStore.private),
      );
    });
  });
});
