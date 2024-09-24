import {
  actionNameToOptions,
  cleanUpIfText,
  getPercentage,
  randomize,
  stringifyWithKeys,
  tryCatch,
} from "../utils";

describe("Given a function randomize", () => {
  describe("When called with a range of 1 to 100", () => {
    test("Then it should return a number within the expected range", () => {
      const value = 10;
      const [min, max] = [1, 100];
      const result = randomize(value, [max, min]);

      expect(result).toBeGreaterThanOrEqual(min * value);
      expect(result).toBeLessThanOrEqual(max * value);
    });

    test("Then it should return a number with two decimal points", () => {
      const value = 5;
      const [min, max] = [10, 20];
      const result = randomize(value, [max, min]);

      expect(result).toEqual(parseFloat(result.toFixed(2)));
    });
  });
});

describe("Given a function tryCatch", () => {
  const successCallback = jest.fn().mockResolvedValue("Success");
  const failureCallback = jest.fn().mockRejectedValue(new Error("Failure"));

  describe("When called with a successful callback", () => {
    it("Then it should return the 'Success' and an undefined error", async () => {
      const [result, error] = await tryCatch(successCallback);

      expect(result).toBe("Success");
      expect(error).toBeUndefined();
    });
  });

  describe("When called with a failing callback", () => {
    it("Then it should return an undefined response and a 'Failure' as error", async () => {
      const [result, error] = await tryCatch(failureCallback);

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe("Failure");
    });
  });
});

describe("Given a getPercentage function", () => {
  describe("When called with a first number of '20' and a second number of '100'", () => {
    test("Then it should return '80'", () => {
      const result = getPercentage(20, 100);

      expect(result).toBe(80);
    });
  });

  describe("When called with a first number of '100' and a second number of '100'", () => {
    test("Then it should return '0'", () => {
      const result = getPercentage(100, 100);

      expect(result).toBe(0);
    });
  });

  describe("When called with a first number of '120' and a second number of '100'", () => {
    test("Then it should return '-20'", () => {
      const result = getPercentage(120, 100);

      expect(result).toBe(-20);
    });
  });
});

describe("Given a stringifyWithKeys function", () => {
  describe("Given an object with non-empty values", () => {
    test("When called, then it should return a formatted string with keys in uppercase", () => {
      const item = { name: "John", age: "30" };
      const result = stringifyWithKeys(item);

      expect(result).toBe(`[NAME] ${item.name}; [AGE] ${item.age}`);
    });
  });

  describe("Given an object with empty or falsy values", () => {
    test("When called, then it should skip those entries in the result", () => {
      const item = { name: "John", age: "" };
      const result = stringifyWithKeys(item);

      expect(result).toBe(`[NAME] ${item.name}`);
    });
  });

  describe("Given an empty object", () => {
    test("When called, then it should return an empty string", () => {
      const item = {};
      const result = stringifyWithKeys(item);

      expect(result).toBe("");
    });
  });
});

/**
 * TODO: Lacking test-case for explicit special characters
 */
describe("Given a cleanUpIfText function", () => {
  describe("Given a string with and extra spaces", () => {
    test("When called, then it should clean up the string", () => {
      const text = "Hello    World";
      const result = cleanUpIfText(text);

      expect(result).toBe("Hello World");
    });
  });

  describe("Given a string with no special characters", () => {
    test("When called, then it should trim and keep the string intact", () => {
      const text = "   Clean text   ";
      const result = cleanUpIfText(text);

      expect(result).toBe("Clean text");
    });
  });

  describe("Given a non-string value", () => {
    test("When called, then it should return the value unchanged", () => {
      const number = 123;
      const result = cleanUpIfText(number);

      expect(result).toBe(number);
    });
  });
});

describe("Given an actionNameToOptions function", () => {
  describe("Given a text 'testAction'", () => {
    test("When called, then it should return an object with the same text as the name property", () => {
      const input = "testAction";
      const result = actionNameToOptions(input);

      expect(result).toEqual({ name: "testAction" });
    });
  });

  describe("Given an object with name and some random data", () => {
    test("When called, then it should return the same object", () => {
      const input = { name: "customAction", data: { id: 1 } };
      const result = actionNameToOptions(input);

      expect(result).toEqual(input);
    });
  });
});
