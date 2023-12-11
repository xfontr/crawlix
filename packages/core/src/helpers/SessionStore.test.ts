import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import SessionStore from "./SessionStore";

describe("Given a SessionStore function", () => {
  describe("When started and getting the current store value", () => {
    test("Then it should return the current store value", () => {
      const expectedStore = {
        ...mockSessionConfig,
        date: new Date(),
      };

      const store = SessionStore().init(mockSessionConfig).current();

      expect(store).toStrictEqual(expectedStore);
    });
  });
});
