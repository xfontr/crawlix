import { UUID } from "crypto";
import t from "../i18n";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import SessionData from "../types/SessionData";
import SessionStore from "./SessionStore";
import DefaultItem from "../types/DefaultItem";

const mockWarning = jest.fn();
const mockEmit = jest.fn();
const mockOn = jest.fn();

jest.mock("../logger", () => ({
  warningMessage: (...args: unknown[]) => mockWarning(...args),
}));

jest.mock("crypto", () => ({
  randomUUID: () => "random-uuid",
}));

jest.mock("../utils/EventBus", () => ({
  emit: (...args: unknown[]) => mockEmit(...args),
  on: (...args: unknown[]) => mockOn(...args),
}));

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
        items: [],
        location: mockSessionConfig.offset as Required<SessionData["offset"]>,
        totalItems: 0,
        history: [mockSessionConfig.offset.url ?? ""],
        _id: "random-uuid" as UUID,
      };

      const {
        current,
        end: cleanUpEnd,
        countAction,
      } = SessionStore().init(mockSessionConfig);

      expect(current()).toStrictEqual(expectedStore);
      expect(mockOn).toHaveBeenCalledWith("ACTION:COUNT", countAction);

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
        items: [],
        totalItems: 0,
        history: [mockSessionConfig.offset.url ?? ""],
        location: mockSessionConfig.offset as Required<SessionData["offset"]>,
        _id: "random-uuid" as UUID,
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

describe("Given a SessionStore.updateLocation function", () => {
  describe("When called with an item 'test' and a page '2'", () => {
    test("Then it should set said values in the current location", () => {
      const item = "test",
        page = 2;

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation({ item, page });

      expect(current().location).toStrictEqual({
        ...mockSessionConfig.offset,
        item,
        page,
      });

      cleanUpEnd();
    });
  });

  describe("When called only with an item 'test'", () => {
    test("Then it should set the item, but not update the page", () => {
      const item = "test",
        page = 2,
        newItem = "second test";

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation({ item, page });

      expect(current().location.page).toBe(page);

      updateLocation({ item: newItem });

      expect(current().location).toStrictEqual({
        ...mockSessionConfig.offset,
        item: newItem,
        page,
      });

      cleanUpEnd();
    });
  });

  describe("When called with no item and an url", () => {
    test("Then it should only update the url", () => {
      const url = "www.test.com";

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation({ url });

      expect(current().location.url).toBe(url);
      expect(current().location.item).toBe(mockSessionConfig.offset.item);

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.nextPage function", () => {
  describe("When called with a url", () => {
    test("Then it should increase the current page, update the url and the history", () => {
      const url = "www.test.com";
      const expectedPage = (mockSessionConfig.offset.page ?? 0) + 1;
      const expectedHistory = [mockSessionConfig.offset.url, url];

      const {
        end: cleanUpEnd,
        nextPage,
        current,
      } = SessionStore().init(mockSessionConfig);

      nextPage(url);

      const currentStore = current();

      expect(currentStore.location.url).toBe(url);
      expect(currentStore.location.page).toBe(expectedPage);
      expect(currentStore.history).toStrictEqual(expectedHistory);

      cleanUpEnd();
    });
  });

  describe("When called with no url", () => {
    test("Then it should increase the current page, but not update anything url related", () => {
      const expectedPage = (mockSessionConfig.offset.page ?? 0) + 1;
      const expectedHistory = [mockSessionConfig.offset.url ?? ""];

      const {
        end: cleanUpEnd,
        nextPage,
        current,
      } = SessionStore().init(mockSessionConfig);

      nextPage();

      const currentStore = current();

      expect(currentStore.location.url).toBe(mockSessionConfig.offset.url);
      expect(currentStore.location.page).toBe(expectedPage);
      expect(currentStore.history).toStrictEqual(expectedHistory);

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.previousPage function", () => {
  describe("When called with a url at the page '5'", () => {
    test("Then it should decrease the current page, update the url and the history", () => {
      const initialPage = 5;
      const expectedPage = initialPage - 1;
      const url = "www.test.com";
      const expectedHistory = [mockSessionConfig.offset.url, url];

      const {
        end: cleanUpEnd,
        previousPage,
        current,
      } = SessionStore().init({
        ...mockSessionConfig,
        offset: { ...mockSessionConfig.offset, page: initialPage },
      });

      previousPage(url);

      const currentStore = current();

      expect(currentStore.location.url).toBe(url);
      expect(currentStore.location.page).toBe(expectedPage);
      expect(currentStore.history).toStrictEqual(expectedHistory);

      cleanUpEnd();
    });
  });

  describe("When called with no url at the page '1'", () => {
    test("Then it should not update anything url related, nor update the page, and send a warning message", () => {
      const initialPage = 1,
        expectedPage = 0;
      const expectedHistory = [mockSessionConfig.offset.url];

      const {
        end: cleanUpEnd,
        previousPage,
        current,
      } = SessionStore().init({
        ...mockSessionConfig,
        offset: { ...mockSessionConfig.offset, page: initialPage },
      });

      previousPage();
      previousPage();

      const currentStore = current();

      expect(currentStore.location.url).toBe(mockSessionConfig.offset.url);
      expect(currentStore.location.page).toBe(expectedPage);
      expect(currentStore.history).toStrictEqual(expectedHistory);

      expect(mockWarning).toHaveBeenCalledWith(
        t("session_store.warning.no_previous_page"),
      );
      expect(mockWarning).toHaveBeenCalledTimes(1);

      cleanUpEnd();
    });
  });

  describe("When called with no url", () => {
    test("Then it should increase the current page, but not update anything url related", () => {
      const expectedPage = (mockSessionConfig.offset.page ?? 0) + 1;
      const expectedHistory = [mockSessionConfig.offset.url ?? ""];

      const {
        end: cleanUpEnd,
        nextPage,
        current,
      } = SessionStore().init(mockSessionConfig);

      nextPage();

      const currentStore = current();

      expect(currentStore.location.url).toBe(mockSessionConfig.offset.url);
      expect(currentStore.location.page).toBe(expectedPage);
      expect(currentStore.history).toStrictEqual(expectedHistory);

      cleanUpEnd();
    });
  });
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
          itemNumber: current().items.length,
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
          itemNumber: current().items.length,
        },
        actionNumber: current().totalActions,
      };

      logError(error, expectedLog.isCritical);

      expect(current().errorLog).toStrictEqual([expectedLog]);

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.postItem function", () => {
  describe("When called with an item and a selector", () => {
    const mockItem: Omit<DefaultItem, "_meta"> = {
      author: "tester",
      categories: ["one"],
      posted: new Date(),
      title: "test",
      _meta: {},
    };

    const selector = "h3";

    test("Then it should post said item with its corresponding meta data", () => {
      const expectedMeta: Pick<DefaultItem, "_meta"> = {
        _meta: {
          id: "random-uuid" as UUID,
          itemNumber: mockSessionConfig.offset.itemNumber ?? 0,
          page: mockSessionConfig.offset.page ?? 0,
          posted: new Date(),
          selector,
        },
      };

      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      postItem(mockItem, selector);

      const item = current().items[0];

      expect({ ...item, _meta: {} }).toStrictEqual(mockItem);
      expect(item?._meta).toStrictEqual(expectedMeta._meta);
      expect(current().totalItems).toBe(1);

      cleanUpEnd();
    });

    test("Then it should do nothing if the maximum amount of items was reached", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init({ ...mockSessionConfig, limit: 0 });

      postItem(mockItem, selector);

      expect(current().items).toHaveLength(0);

      cleanUpEnd();
    });

    test("Then it should do nothing if no item was passed", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      postItem();

      expect(current().items).toHaveLength(0);

      cleanUpEnd();
    });

    test("Then it should set an empty selector if none was passed", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      postItem(mockItem);

      expect(current().items[0]?._meta.selector).toBe("");

      cleanUpEnd();
    });

    test("Then it should post the item and call off the session if there are too many items", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init({ ...mockSessionConfig, limit: 1 });

      postItem(mockItem, selector);

      expect(current().totalItems).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith("SESSION:ACTIVE", false);
      expect(mockEmit).toHaveBeenCalledTimes(1);

      cleanUpEnd();
    });
  });
});
