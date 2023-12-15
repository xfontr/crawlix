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

  describe("When ended twice", () => {
    test("It should throw an error", () => {
      const expectedError = t("session_store.error.not_initialized");

      const { end } = SessionStore().init(mockSessionConfig);

      end();

      expect(SessionStore().end).toThrow(new Error(expectedError));
    });
  })

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

describe("Given a SessionStore.updateLocation function", () => {
  describe("When called with an item 'test' and a page '2'", () => {
    test("Then it should set said values in the current location", () => {
      const item = "test", page = 2;

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation(item, page);

      expect(current().location).toStrictEqual({ item, page });

      cleanUpEnd();
    });
  });

  describe("When called only with an item 'test'", () => {
    test("Then it should set the item, but not update the page", () => {
      const item = "test", page = 2, newItem = "second test";

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation(item, page);

      expect(current().location.page).toBe(page);

      updateLocation(newItem);

      expect(current().location).toStrictEqual({ item: newItem, page });

      cleanUpEnd();
    })
  })
});

describe("Given a SessionStore.logError function", () => {
  describe("When called with a critical error", () => {
    test("Then it should register the error with the current session data", () => {
      const {
        current,
        end: cleanUpEnd,
        logError,
      } = SessionStore().init(mockSessionConfig);

      const error = new Error("test");
      const expectedLog = {
        error,
        isCritical: true,
        time: new Date(),
        location: {
          ...current().location,
          itemNumber: current().items,
        },
        actionNumber: current().totalActions,
      };

      logError(error, expectedLog.isCritical);

      expect(current().errorLog).toStrictEqual([expectedLog]);

      cleanUpEnd();
    });
  });

  describe("When called with a non critical error", () => {
    test("Then it should register the error with the current session data", () => {
      const {
        current,
        end: cleanUpEnd,
        logError,
      } = SessionStore().init(mockSessionConfig);

      const error = new Error("test");
      const expectedLog = {
        error,
        isCritical: false,
        time: new Date(),
        location: {
          ...current().location,
          itemNumber: current().items,
        },
        actionNumber: current().totalActions,
      };

      logError(error, expectedLog.isCritical);

      expect(current().errorLog).toStrictEqual([expectedLog]);

      cleanUpEnd();
    });
  });
});