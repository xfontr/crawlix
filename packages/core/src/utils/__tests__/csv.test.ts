import { mockItem } from "../../test-utils/mocks/mockItem";
import type { UnknownItem } from "../../types/Item";
import {
  SESSION_ID_HEADER,
  cleanItems,
  convertToItems,
  createHeader,
  currentFileLocation,
  namePrefix,
  newKey,
  splitItems,
} from "../csv";

const FILENAME = "items";

const mockFiles = [
  `${namePrefix(0, FILENAME)}.csv`,
  `${namePrefix(1, FILENAME)}.csv`,
];

jest.mock("fs/promises", () => ({
  readdir: async (path: string) =>
    await new Promise((resolve) => {
      if (path === "correct-path") resolve(mockFiles);
      resolve([]);
    }),
}));

describe("Given a createHeader function", () => {
  describe("When called with an Item", () => {
    test("Then it should return a list of headers", () => {
      const expectedHeaders = [
        newKey("test1"),
        newKey("test_two"),
        newKey("_test_three"),
      ];

      const mockUnknownItem: UnknownItem = {
        test1: "test",
        testTwo: "test",
        _meta: {
          testThree: "test",
        },
      };

      const result = createHeader(mockUnknownItem);

      expect(result).toStrictEqual(expectedHeaders);
    });
  });
});

describe("Given a splitItems function", () => {
  describe("When called with a list of 10 items and a breakpoint of 5", () => {
    test("Then it should return two lists of 5 items each", () => {
      const totalItems = 10;
      const items = new Array(totalItems).fill(mockItem);

      const breakpoint = 5;

      const [previous, next] = splitItems(items, breakpoint);

      expect(previous).toHaveLength(10 - breakpoint);
      expect(next).toHaveLength(10 - breakpoint);
    });
  });

  describe("When called with a list of 10 items and a breakpoint of 11", () => {
    test("It should return the original items and an empty array", () => {
      const totalItems = 10;
      const items = new Array(totalItems).fill({ ...mockItem });

      const breakpoint = 11;

      const [previous, next] = splitItems(items, breakpoint);

      expect(previous).toHaveLength(totalItems);
      expect(next).toStrictEqual([]);
    });
  });
});

describe("Given a convertToItems function", () => {
  describe("When called with a list of data and headers", () => {
    test("Then it should return a list of items", () => {
      const totalItems = 5;
      const headers = ["id", "name"];
      const dataItem = [["0"], ["John"]];
      const data = new Array(totalItems).fill([
        ...dataItem,
      ]) as (typeof dataItem)[];

      const expectedItems = new Array(totalItems).fill({
        [headers[0]!]: dataItem[0]![0],
        [headers[1]!]: dataItem[1]![0],
      });

      const result = convertToItems(data, headers);

      expect(result).toStrictEqual(expectedItems);
    });
  });
});

describe("Given a currentFileLocation function", () => {
  describe("When called with a file name and a path with two files", () => {
    test("Then it should return the last file name and its index", async () => {
      const expectedResult: Awaited<ReturnType<typeof currentFileLocation>> = {
        fileIndex: mockFiles.length - 1,
        filename: mockFiles[1]!.split(".")[0]!,
      };
      const result = await currentFileLocation(FILENAME, "correct-path");

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe("When called with a file name and a path with no files", () => {
    test("Then it should return a new index and a file name with said index", async () => {
      const expectedResult: Awaited<ReturnType<typeof currentFileLocation>> = {
        fileIndex: 0,
        filename: mockFiles[0]!.split(".")[0]!,
      };
      const result = await currentFileLocation(FILENAME, "");

      expect(result).toStrictEqual(expectedResult);
    });
  });
});

describe("Given a cleanItems function", () => {
  describe("When called with a list of items and an id", () => {
    test("Then it should return the same list but with updated keys and stringified values", () => {
      const mockSimpleItem = {
        authorName: "tester",
        imgAlt: 109,
        categories: ["one", "two"],
        posted: {
          date: 10,
        },
        _meta: {
          randomData: "",
        },
      };

      const items = new Array(2).fill(
        mockSimpleItem,
      ) as (typeof mockSimpleItem)[];

      const expectedItems = new Array(2).fill({
        author_name: "tester",
        img_alt: "109",
        categories: JSON.stringify(["one", "two"]),
        posted: JSON.stringify({
          date: 10,
        }),
        _session_id: "id",
        _random_data: "",
        _more_meta: "test",
      });

      const result = cleanItems(items, {
        [SESSION_ID_HEADER]: "id",
        moreMeta: "test",
      });

      expect(result).toStrictEqual(expectedItems);
    });
  });
});
