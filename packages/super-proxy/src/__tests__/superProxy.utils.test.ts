import { mockText } from "../superProxy.mocks";
import { SuperProxyStore } from "../superProxy.types";
import { capitalize, superProxyStoreInitialState } from "../superProxy.utils";

describe("Given a capitalize function", () => {
  describe(`When called with '${mockText.toLowerCase()}'`, () => {
    test(`Then it should return ${mockText}`, () => {
      const textToCapitalize = mockText.toLowerCase();

      const result = capitalize(textToCapitalize);

      expect(result).toBe(mockText);
    });
  });

  describe("When called with no parameters", () => {
    test("Then it should return ''", () => {
      const expectedResult = "";

      const result = capitalize();

      expect(result).toBe(expectedResult);
    });
  });
});

describe("Given a superProxyStoreInitialState function", () => {
  describe("When called", () => {
    test("Then it should return an empty initial state with the plugins and the currenet values", () => {
      const expectedResult: {
        current: SuperProxyStore<object, []>["current"];
        plugins: SuperProxyStore<object, []>["plugins"];
      } = {
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
      };

      const result = superProxyStoreInitialState();

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
