import { generateDate, generateTimestamp } from "../locationUtils";

const TIME_DIFFERENCE = 1_000;

afterEach(jest.useRealTimers);

describe("Given a generateTimestamp function", () => {
  describe("When called with a start and an end date", () => {
    test("Then it should return the difference in milliseconds", () => {
      const now = new Date().getTime();
      const endDate = now + TIME_DIFFERENCE;

      const timestamp = generateTimestamp(now, endDate);

      expect(timestamp).toBe(TIME_DIFFERENCE);
    });
  });

  describe("When called with no end date", () => {
    test("Then it should grab the current time and return the difference", () => {
      jest.useFakeTimers();

      const now = new Date().getTime();
      const endDate = now + TIME_DIFFERENCE;

      jest.advanceTimersByTime(1_000);
      const timestamp = generateTimestamp(now, endDate);

      expect(timestamp).toBe(TIME_DIFFERENCE);
    });
  });
});

describe("Given a generateDate function", () => {
  describe("When called", () => {
    test("Then it should return a timestamp", () => {
      jest.useFakeTimers();

      const expectedDate = new Date().getTime();
      const date = generateDate();

      expect(date).toBe(expectedDate);
    });
  });
});
