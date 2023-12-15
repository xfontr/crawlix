import t from "../i18n";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import SessionData from "../types/SessionData";
import SessionStore from "./SessionStore";

jest.useFakeTimers();

describe("Given a SessionStore function", () => {
  describe("When started and getting the current store value", () => {
    test("Then it should return the current store value", () => {
      const expectedStore: Partial<SessionData> = {
        ...mockSessionConfig,
        startDate: new Date(),
        totalActions: 0,
        totalActionsJointLength: 0,
        errorLog: [],
        items: 0,
        location: mockSessionConfig.offset,
      };

      const { current, end: cleanUpEnd } =
        SessionStore().init(mockSessionConfig);

      expect(current()).toStrictEqual(expectedStore);

      cleanUpEnd();
    });
  });

  describe("When ended", () => {
    test("It should return all the store data, updated with the end values", () => {
      const expectedStore: Partial<SessionData> = {
        ...mockSessionConfig,
        startDate: new Date(),
        endDate: new Date(),
        duration: 0,
        totalActions: 0,
        totalActionsJointLength: 0,
        errorLog: [],
        items: 0,
        location: mockSessionConfig.offset,
      };

      const { end } = SessionStore().init(mockSessionConfig);

      expect(end()).toStrictEqual(expectedStore);
    });
  });

  describe("When started twice", () => {
    test("It should throw an error if the first session wasn't ended", () => {
      const expectedError = t("session_store.error.initialized");

      const { end: cleanUpEnd } = SessionStore().init(mockSessionConfig);

      expect(SessionStore().init).toThrow(new Error(expectedError));

      cleanUpEnd();
    });

    test("It should allow a second start if the first session was ended", () => {
      const { end } = SessionStore().init(mockSessionConfig);

      end();

      const { init, end: cleanUpEnd } = SessionStore();

      expect(() => init(mockSessionConfig)).not.toThrow();

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.countAction function", () => {
  describe("When called with a speed of '1'", () => {
    test(`Then it should increase the total amount of actions by '1' and the time by '${mockSessionConfig.taskLength}'`, () => {
      const speed = 1;

      const {
        countAction,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      countAction(speed);

      expect(current().totalActions).toBe(speed);
      expect(current().totalActionsJointLength).toBe(
        mockSessionConfig.taskLength * speed,
      );

      cleanUpEnd();
    });
  });
});
