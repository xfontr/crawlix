import isItemComplete from "./isItemComplete";

describe("Given an isItemComplete function", () => {
  describe("When called with no items", () => {
    test("Then it should return 'false'", () => {
      const expectedResult = false;

      const result = isItemComplete();

      expect(result).toBe(expectedResult);
    });
  });

  describe("When called with a complete item", () => {
    test("Then it should return 'true'", () => {
      const expectedResult = true;

      const result = isItemComplete({
        author: "Test",
        description: "Test",
      });

      expect(result).toBe(expectedResult);
    });
  });

  describe("When called with an incomplete item", () => {
    test("Then it should return 'false'", () => {
      const expectedResult = false;

      const result = isItemComplete({
        author: "Test",
        description: undefined,
      });

      expect(result).toBe(expectedResult);
    });
  });
});
