import { ItemStore } from "../../types";
import { buildItemMeta } from "../itemMetaData";

describe("Given a buildItemMeta function", () => {
  describe("When called with an item and all required fields", () => {
    test("Then it should compute isComplete and completion as 100%", () => {
      const item = { name: "John", age: 30 };
      const mockItemStore = {
        currentRef: item,
        currentRefErrors: [],
      } as unknown as ItemStore;

      const required = ["name", "age"] as (keyof typeof item)[];
      const { isComplete, completion } = buildItemMeta(mockItemStore, required);

      expect(isComplete).toBe(true);
      expect(completion).toBe(100);
    });
  });

  describe("When called with an incomplete item but no undefined fields", () => {
    test("Then it should anyways compute a 100% completion", () => {
      const item = { name: "John" };
      const mockItemStore = {
        currentRef: item,
        currentRefErrors: [],
      } as unknown as ItemStore;

      const required = ["name", "age"] as (keyof typeof item)[];
      const { emptyFields, completion } = buildItemMeta(
        mockItemStore,
        required,
      );

      expect(emptyFields).toBeUndefined();
      expect(completion).toBe(100);
    });
  });

  describe("When called with a complete item but undefined fields", () => {
    test("Then it should not compute a 100% completion", () => {
      const item = { name: "John", age: undefined };
      const mockItemStore = {
        currentRef: item,
        currentRefErrors: [],
      } as unknown as ItemStore;

      const required = ["name", "age"] as (keyof typeof item)[];
      const { emptyFields, completion } = buildItemMeta(
        mockItemStore,
        required,
      );

      expect(emptyFields).toEqual(["age"]);
      expect(completion).toBe(50);
    });
  });

  describe("When called with a store with current errors", () => {
    test("Then it should include said errors", () => {
      const item = { name: "John", age: undefined };
      const required = ["name", "age"] as (keyof typeof item)[];
      const errors = ["age is required"];
      const mockItemStore = {
        currentRef: item,
        currentRefErrors: errors,
      } as unknown as ItemStore;

      const { errors: computedErrors } = buildItemMeta(mockItemStore, required);

      expect(computedErrors).toEqual(errors);
    });
  });
});
