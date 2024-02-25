import { snakelise } from "@personal/utils";
import { clean } from "../cleanItems";

describe("Given a cleanItems function", () => {
  describe("When called with a key and a value", () => {
    test("Then it should return an object with an snakelised key and value", () => {
      const key = "keyTest";
      const value = "keyValue";

      const expectedResult = {
        [snakelise(key)]: value,
      };

      const result = clean(key, value);

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe("When called with a key and a non-string value", () => {
    test("Then it should return an object with an snakelised key and a stringified value", () => {});
  });
});
