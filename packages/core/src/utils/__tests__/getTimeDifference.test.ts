import getTimeDifference from "../getTimeDifference";

jest.useFakeTimers();

describe("Given a getTimeDifference function", () => {
  describe("When called with a start date in Date format", () => {
    test("Then it should return the difference between now and said date", () => {
      const date = new Date();
      const advancedTime = 10;

      jest.advanceTimersByTime(advancedTime);

      const result = getTimeDifference(date);

      expect(result).toBe(advancedTime);
    });
  });

  describe("When called with a start date in a valid string format", () => {
    test("Then it should return the difference between now and said date", () => {
      const date = new Date().getTime();
      const advancedTime = 10;

      jest.advanceTimersByTime(advancedTime);

      const result = getTimeDifference(date);

      expect(result).toBe(advancedTime);
    });
  });

  describe("When called with a start date in an invalid string format", () => {
    test("Then it should return 0", () => {
      const date = "test";
      const advancedTime = 10;

      jest.advanceTimersByTime(advancedTime);

      const result = getTimeDifference(date);

      expect(result).toBe(0);
    });
  });

  describe("When called with a start date in a valid number format", () => {
    test("Then it should return the difference between now and said date", () => {
      const date = new Date().getTime();
      const advancedTime = 10;

      jest.advanceTimersByTime(advancedTime);

      const result = getTimeDifference(date);

      expect(result).toBe(advancedTime);
    });
  });

  describe("When called with a start date in an invalid number format", () => {
    test("Then it should return the difference between now and said date", () => {
      // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
      const date = -9999999999999999;
      const advancedTime = 10;

      jest.advanceTimersByTime(advancedTime);

      const result = getTimeDifference(date);

      expect(result).toBe(0);
    });
  });

  describe("When called with valid start and end dates", () => {
    test("Then it should return the difference between the two", () => {
      const startDate = new Date();

      const advancedTime = 10;
      jest.advanceTimersByTime(advancedTime);

      const endDate = new Date();

      const result = getTimeDifference(startDate, endDate);

      expect(result).toBe(advancedTime);
    });
  });

  describe("When called with an invalid end date", () => {
    test("Then it should return 0", () => {
      const startDate = new Date();

      const advancedTime = 10;
      jest.advanceTimersByTime(advancedTime);

      const endDate = new Date("test");

      const result = getTimeDifference(startDate, endDate);

      expect(result).toBe(0);
    });
  });
});
