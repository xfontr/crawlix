import t from "../../i18n";
import useItem from "../useItem";

describe("Given a UseItem function", () => {
  const errorMessage = t("session_store.empty_attribute");

  const initialState = {
    test: "test",
  };

  const mockNewAttribute = {
    mockNewAttribute1: "test_1",
  };

  const mockDirtyItem = {
    dirty:
      " ISBN-10\n" +
      "                                    ‏\n" +
      "                                        :\n" +
      "                                    ‎\n" +
      "                                 0241433444 ",
  };

  describe("When called the setAttributes returned function several times with several item attributes", () => {
    test("It should save them at the stored item", () => {
      const { setAttributes, get } = useItem({ initialState });

      setAttributes(mockNewAttribute);

      const mockNewAttribute2 = {
        mockNewAttribute2: "test_2",
      };

      setAttributes(mockNewAttribute2);

      const mockNewAttributeReplaced = {
        mockNewAttribute1: "replaced",
      };

      setAttributes(mockNewAttributeReplaced);

      expect(get()).toStrictEqual({
        ...initialState,
        ...mockNewAttribute2,
        ...mockNewAttributeReplaced,
      });
    });
  });

  describe("When called the history getter after using the item with backups enabled", () => {
    test("It should return the history of items and errors", () => {
      const expectedHistory = [
        {
          item: mockNewAttribute,
          errorLog: {},
        },
      ];

      const { use, getHistory, setAttributes } = useItem({
        enableBackup: true,
      });

      const currentHistory = getHistory();

      expect(currentHistory).toStrictEqual([]);

      setAttributes(mockNewAttribute);
      use(() => undefined);

      const finalHistory = getHistory();

      expect(finalHistory).toStrictEqual(expectedHistory);
    });
  });

  describe("When called the item getter", () => {
    test("It should return the current item", () => {
      const { get } = useItem({ initialState });

      /**
       * We clone the initial state to make sure the script won't mutate the initial state,
       * thus altering the results of this test.
       */
      const expectedItem = { ...initialState };

      get().test = "This will not be stored in the actual item";

      expect(get()).toStrictEqual(expectedItem);
    });
  });

  describe("When called the manual error adder with an error", () => {
    test("Then it should log said error", () => {
      const { addErrors, getErrors } = useItem({ initialState });

      const newError = { test: "test" };

      addErrors(newError);

      expect(getErrors()).toStrictEqual(newError);
    });
  });

  describe("When called the error checker with no required type", () => {
    test("Then it should check that every stored value has an actual value", () => {
      const expectedErrors = {
        test: errorMessage,
        test1: errorMessage,
        test2: errorMessage,
        test3: errorMessage,
      };

      const { checkErrors, getErrors } = useItem({
        initialState: {
          test: "",
          test1: NaN,
          test2: null as unknown as undefined,
          test3: undefined,
          test4: 0,
        },
      });

      checkErrors();

      expect(getErrors()).toStrictEqual(expectedErrors);
    });
  });

  describe("When called the error checker with a required type", () => {
    test("Then it should check that the mandatory values have an actual value", () => {
      const { checkErrors, getErrors } = useItem({
        initialState: {
          test: "",
          test0: "",
          test1: "",
        },
        requiredType: ["test", "test0"],
      });

      const expectedErrors = {
        test: errorMessage,
        test0: errorMessage,
      };

      checkErrors();

      expect(getErrors()).toStrictEqual(expectedErrors);
    });
  });

  describe("When called the cleaner", () => {
    test("Then it should clean each item of dirty strings", () => {
      const globalExpectedItem = {
        dirty: "-10:0241433444",
      };

      const localExpectedItem = {
        dirty: "0241433444",
      };

      const { clean, get } = useItem({
        initialState: mockDirtyItem,
        customCleaner: ["ISBN", ""],
      });

      clean();

      expect(get().dirty).toStrictEqual(globalExpectedItem.dirty);

      clean(["-10:", ""]);

      expect(get().dirty).toStrictEqual(localExpectedItem.dirty);
    });
  });

  describe("When called the reset", () => {
    test("Then it should empty the item and error log, but leave the history untouched", () => {
      const { get, getErrors, getHistory, reset, use, setAttributes } = useItem(
        { initialState, enableBackup: true },
      );

      // Pushes the first item to the history and runs reset in the background
      use(() => undefined);

      // Sets some values at the current state
      setAttributes(initialState);

      reset();

      expect(get()).toStrictEqual({});
      expect(getErrors()).toStrictEqual({});
      expect(getHistory()).toStrictEqual([
        {
          item: initialState,
          errorLog: {},
        },
      ]);
    });

    test("Then it should empty every stored value, if instructed to do so", () => {
      const { get, getErrors, getHistory, reset, use, setAttributes } = useItem(
        { initialState, enableBackup: true },
      );

      // Pushes the first item to the history and runs reset in the background
      use(() => undefined);

      // Sets some values at the current state
      setAttributes(initialState);

      reset(true);

      expect(get()).toStrictEqual({});
      expect(getErrors()).toStrictEqual({});
      expect(getHistory()).toStrictEqual([]);
    });
  });

  describe("When called the use item function with all the clean up options enabled", () => {
    test("Then it should call the callback with the item and its errors, after running every function", () => {
      const expectedItem = {
        dirty: "0241433444",
        test: "",
      };

      const expectedErrors = {
        test: errorMessage,
      };

      const expectedHistory = [
        {
          item: expectedItem,
          errorLog: expectedErrors,
        },
      ];

      const callback = <T, E>(item: T, errorLog: E) => ({
        item,
        errorLog,
      });

      const { use, setAttributes, getHistory } = useItem<{
        test: string;
        dirty: string;
      }>({
        initialState: mockDirtyItem,
        autoClean: true,
        autoLogErrors: true,
        customCleaner: ["ISBN-10:", ""],
        enableBackup: true,
        requiredType: ["test"],
      });

      setAttributes({ test: "" });

      const result = use(callback);

      expect(result).toStrictEqual(expectedHistory[0]);
      expect(getHistory()).toStrictEqual(expectedHistory);
    });
  });
});
