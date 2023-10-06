import {
  mockProxiedItem,
  mockReturnedSuperProxyStore,
  mockSuperProxyStore,
  mockText,
  //   mockText,
} from "../superProxy.mocks";
import { PublicStoreGetters, PublicStoreSetters } from "../superProxy.types";

/**
 * Structure of the private key of the store
 */
describe("Given a superProxyService function", () => {
  describe("When called with the minimum parameters", () => {
    test("Should return a correct full private store", () => {
      expect(JSON.stringify(mockReturnedSuperProxyStore().private)).toBe(
        JSON.stringify(mockSuperProxyStore().private),
      );
    });
  });
});

/**
 * Public store getters and setters
 */
describe("Given the returned public store from the superProxyService function", () => {
  describe(`When called each setter with the text '${mockText}'`, () => {
    const expectedGetters: (keyof PublicStoreGetters<
      typeof mockProxiedItem,
      []
    >)[] = ["getAfter", "getBefore", "getMain", "getMethod"];

    const expectedSetters: (keyof PublicStoreSetters<
      typeof mockProxiedItem,
      []
    >)[] = ["setAfter", "setBefore", "setMain", "setMethod"];

    const superProxyStore = mockReturnedSuperProxyStore();
    const expectedNumberOfActions = Object.keys(
      superProxyStore.public.storeActions,
    ).length;

    let numberOfSettersAndGetters = 0;

    expectedSetters.forEach((setter) => {
      superProxyStore.public.storeActions[setter](mockText);
      numberOfSettersAndGetters += 1;
    });

    expectedGetters.forEach((getter) => {
      test(`The getter $${getter} should return its new value`, () => {
        expect(superProxyStore.public.storeActions[getter]()).toBe(mockText);
      });
      numberOfSettersAndGetters += 1;
    });

    /**
     * TS won't force us to define all the getters and setters in the two previous arrays.
     * Therefore, we track any update by both having strict typing and making sure the
     * amount is correct.
     */
    test(`The amount of store actions should be ${expectedNumberOfActions}`, () => {
      expect(numberOfSettersAndGetters).toBe(expectedNumberOfActions);
    });
  });
});
