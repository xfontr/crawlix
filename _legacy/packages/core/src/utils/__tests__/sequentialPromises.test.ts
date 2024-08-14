import mockPromiseFunction from "../../test-utils/mockPromiseFunction";
import promiseAllSeq from "../sequentialPromises";

describe("Given a promiseAllSeq function", () => {
  describe("When called with a promise function and a breaking condition", () => {
    const baseBreakingCondition = () => {
      let index = 0;

      return () => {
        index += 1;
        return index === 4;
      };
    };

    test("Then it should run until the breaking condition is true", async () => {
      let index = -1;

      const result = await promiseAllSeq(async () => {
        index += 1;
        return await mockPromiseFunction({
          advanceTimers: false,
          resolveValue: index,
        });
      }, baseBreakingCondition());

      expect(result).toStrictEqual([0, 1, 2, 3]);
    });
  });
});
