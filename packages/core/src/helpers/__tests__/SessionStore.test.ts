import { UUID } from "crypto";
import t from "../../i18n";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import SessionData from "../../types/SessionData";
import SessionStore from "../SessionStore";
import DefaultItem from "../../types/DefaultItem";
import { mockItemWithoutMeta } from "../../test-utils/mocks/mockItem";
import CreateError from "../../utils/CreateError";

const mockWarning = jest.fn();
const mockEmit = jest.fn();
const mockOn = jest.fn();
const mockRemoveAllListeners = jest.fn();
const mockUsageDataLogError = jest.fn();

jest.mock("../../logger", () => ({
  warningMessage: (...args: unknown[]) => mockWarning(...args),
}));

jest.mock("crypto", () => ({
  randomUUID: () => "random-uuid",
}));

jest.mock("../../helpers/EventBus", () => ({
  emit: (...args: unknown[]) => mockEmit(...args),
  on: (...args: unknown[]) => mockOn(...args),
  removeAllListeners: (...args: unknown[]) => mockRemoveAllListeners(...args),
}));

jest.mock("../../utils/usageData", () => ({
  usageDataLogError: (...args: unknown[]) => mockUsageDataLogError(...args),
}));

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
});

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
        success: true,
        logs: [],
      };

      const {
        current,
        end: cleanUpEnd,
        countAction,
        logMessage,
      } = SessionStore().init(mockSessionConfig);

      expect(current()).toStrictEqual(expectedStore);
      expect(mockOn).toHaveBeenCalledWith("ACTION:COUNT", countAction);
      expect(mockOn).toHaveBeenCalledWith("SESSION:LOG", logMessage);

      cleanUpEnd();
    });
  });

  describe("When ended", () => {
    test("It should return all the store data, updated with the end values", () => {
      const advancedTime = 10;
      const expectedStore: Partial<SessionData> = {
        ...mockSessionConfig,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + advancedTime),
        duration: advancedTime,
        totalActions: 0,
        totalActionsJointLength: 0,
        errorLog: [],
        items: [],
        totalItems: 0,
        history: [mockSessionConfig.offset.url ?? ""],
        location: mockSessionConfig.offset as Required<SessionData["offset"]>,
        _id: "random-uuid" as UUID,
        success: true,
        incompleteItems: 0,
        logs: [],
      };

      const { end } = SessionStore().init(mockSessionConfig);

      jest.advanceTimersByTime(advancedTime);

      expect(end()).toStrictEqual(expectedStore);
      expect(mockRemoveAllListeners).toHaveBeenCalledWith("ACTION:COUNT");
    });

    test("It should update the number of incomplete items and total items", () => {
      const expectedIncompleteItems = 3;

      const { end, postItem } = SessionStore().init(mockSessionConfig);

      postItems(
        expectedIncompleteItems,
        { name: "Test", surname: undefined },
        postItem,
      );

      const { incompleteItems, totalItems } = end();

      expect(incompleteItems).toBe(expectedIncompleteItems);
      expect(totalItems).toBe(expectedIncompleteItems);
    });

    test("It should set success as 'false' if the relative minimum of items wasn't reached", () => {
      const incompleteItems = 3;
      const completeItems = 2;

      const { end, postItem } = SessionStore().init({
        ...mockSessionConfig,
        minimumItemsToSuccess: 0.5,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        postItem,
      );
      postItems(completeItems, { name: "Test", surname: "Test" }, postItem);

      expect(end().success).toBe(false);
    });

    test("It should set success as 'true' if the relative minimum of items was reached", () => {
      const incompleteItems = 3;
      const completeItems = 3;

      const { end, postItem } = SessionStore().init({
        ...mockSessionConfig,
        limit: { items: 10 },
        minimumItemsToSuccess: 0.5,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        postItem,
      );
      postItems(completeItems, { name: "Test", surname: "Test" }, postItem);

      expect(end().success).toBe(true);
    });

    test("It should set success as 'false' if the absolute minimum of items was not reached", () => {
      const incompleteItems = 10;
      const completeItems = 2;

      const { end, postItem } = SessionStore().init({
        ...mockSessionConfig,
        limit: { items: 15 },
        minimumItemsToSuccess: 3,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        postItem,
      );
      postItems(completeItems, { name: "Test", surname: "Test" }, postItem);

      expect(end().success).toBe(false);
    });

    test("It should set success as 'true' if the absolute minimum of items was reached", () => {
      const incompleteItems = 10;
      const completeItems = 3;

      const { end, postItem } = SessionStore().init({
        ...mockSessionConfig,
        limit: { items: 15 },
        minimumItemsToSuccess: 3,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        postItem,
      );
      postItems(completeItems, { name: "Test", surname: "Test" }, postItem);

      expect(end().success).toBe(true);
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

describe("Given a SessionStore.current function", () => {
  describe("When trying to alter its returned value", () => {
    test("It should not alter the actual store values", () => {
      const randomNumber = Math.floor(Math.random() * 1_000);
      const randomString =
        "test" + Math.floor(Math.random() * 1_000).toString();

      const { current, end: cleanUpEnd } =
        SessionStore().init(mockSessionConfig);

      const currentStore = current();

      currentStore.limit.items = randomNumber;
      currentStore.history.push(randomString);

      const updatedCurrentStore = current();

      expect(updatedCurrentStore.limit.items).not.toBe(randomNumber);
      expect(updatedCurrentStore.limit.items).not.toBe(randomString);

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
  describe("When called with a page '2'", () => {
    test("Then it should set said value in the current location", () => {
      const page = 2;

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation({ page });

      expect(current().location).toStrictEqual({
        ...mockSessionConfig.offset,
        page,
      });

      cleanUpEnd();
    });
  });

  describe("When called with an url", () => {
    test("Then it should only update the url", () => {
      const url = "www.test.com";

      const {
        updateLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      updateLocation({ url });

      expect(current().location.url).toBe(url);
      expect(current().location.page).toBe(mockSessionConfig.offset.page);

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

    test("Then it should increase the current page and end the session if it reached its limit", () => {
      const { end: cleanUpEnd, nextPage } = SessionStore().init({
        ...mockSessionConfig,
        limit: { page: 1 },
      });

      nextPage();

      expect(mockEmit).toHaveBeenCalledWith("SESSION:ACTIVE", false);
      expect(mockEmit).toHaveBeenCalledTimes(1);

      cleanUpEnd(); // We have to clean up anyways, since the emit action is mocked and has no real effect
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
      const advancedTime = 10;

      const {
        current,
        end: cleanUpEnd,
        logError,
      } = SessionStore().init(mockSessionConfig);

      jest.advanceTimersByTime(advancedTime);

      const error = CreateError(Error("test"));

      const expectedLog: SessionData["errorLog"][number] = {
        error: {
          name: error.name,
          message: error.message,
          publicMessage: error.message,
        },
        isCritical: true,
        date: new Date(),
        moment: advancedTime,
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

    test("Then it should update the usage data with the last error, if the feature is on", () => {
      const {
        end: cleanUpEnd,
        logError,
        current,
      } = SessionStore().init({ ...mockSessionConfig, usageData: true });

      const firstError = CreateError(new Error("test"));
      const secondError = CreateError(new Error("test-2"));

      logError(firstError);
      logError(secondError);

      expect(mockUsageDataLogError).toHaveBeenCalledWith(
        current().errorLog.at(-1),
      );

      const lastCallErrorMessage = (
        mockUsageDataLogError.mock.calls[1] as SessionData["errorLog"][number][]
      )[0]?.error.message;

      expect(lastCallErrorMessage).toBe(secondError.message);

      cleanUpEnd();
    });

    test("Then it should not update the usage data if the feature is off", () => {
      const { end: cleanUpEnd, logError } = SessionStore().init({
        ...mockSessionConfig,
        usageData: false,
      });

      const error = CreateError(Error("test"));

      logError(error);

      expect(mockUsageDataLogError).not.toHaveBeenCalled();

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

      const error = CreateError(Error("test"));
      const date = new Date();
      const expectedLog: SessionData["errorLog"][number] = {
        error: {
          name: error.name,
          message: error.message,
          publicMessage: error.message,
        },
        isCritical: false,
        date: date,
        moment: 0,
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
    const selector = "h3";

    test("Then it should post said item with its corresponding meta data", () => {
      const advancedTime = 10;
      const itemUrl = "test";

      const {
        postItem,
        end: cleanUpEnd,
        current,
        nextPage,
      } = SessionStore().init(mockSessionConfig);

      nextPage(itemUrl);

      jest.advanceTimersByTime(advancedTime);

      const expectedMeta: Pick<DefaultItem, "_meta"> = {
        _meta: {
          id: "random-uuid" as UUID,
          itemNumber: 0,
          page: mockSessionConfig.offset.page! + 1,
          posted: new Date(),
          moment: advancedTime,
          selector,
          complete: true,
          errorLog: {},
          url: itemUrl,
        },
      };

      postItem(mockItemWithoutMeta, {}, selector);

      const item = current().items[0];

      expect({ ...item, _meta: {} }).toStrictEqual(mockItemWithoutMeta);
      expect(item!._meta).toStrictEqual(expectedMeta._meta);
      expect(current().totalItems).toBe(1);

      cleanUpEnd();
    });

    test("Then it should do nothing if the maximum amount of items was reached", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init({ ...mockSessionConfig, limit: { items: 0 } });

      postItem(mockItemWithoutMeta, {}, selector);

      expect(current().items).toHaveLength(0);

      cleanUpEnd();
    });

    test("Then it should post the item and call off the session if there are too many items", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init({ ...mockSessionConfig, limit: { items: 1 } });

      postItem(mockItemWithoutMeta, {}, selector);

      expect(current().totalItems).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith("SESSION:ACTIVE", false);
      expect(mockEmit).toHaveBeenCalledTimes(1);

      cleanUpEnd();
    });

    describe("When called with no item and no selector", () => {
      test("Then it mark the item as incomplete", () => {
        const {
          postItem,
          end: cleanUpEnd,
          current,
        } = SessionStore().init(mockSessionConfig);

        postItem(undefined, {});

        expect(current().items[0]?._meta.complete).toBe(false);

        cleanUpEnd();
      });

      test("Then it should set an empty selector", () => {
        const {
          postItem,
          end: cleanUpEnd,
          current,
        } = SessionStore().init(mockSessionConfig);

        postItem(mockItemWithoutMeta, {});

        expect(current().items[0]?._meta.selector).toBe("");

        cleanUpEnd();
      });
    });
  });

  describe("When called with an incomplete item", () => {
    test("Then it should mark the item as incomplete", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      postItem({ name: "test", surname: undefined, age: undefined }, {});

      expect(current().items[0]?._meta.complete).toBe(false);

      cleanUpEnd();
    });
  });

  describe("When called with an error log", () => {
    test("Then it should register said log", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      const errorLog = {
        surname: Error("Selector not found"),
        age: Error("Selector not found"),
      };

      postItem({ name: "test", surname: undefined, age: undefined }, errorLog);

      expect(current().items[0]?._meta.errorLog).toStrictEqual(errorLog);

      cleanUpEnd();
    });
  });

  describe("When called with no item and no errorLog", () => {
    test("Then it should register all the meta data, but no item", () => {
      const {
        postItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      postItem(undefined, undefined);

      expect(current().items[0]?._meta.errorLog).toStrictEqual({});
      expect(current().items[0]?._meta.id).toBe("random-uuid");

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.logMessage function", () => {
  describe("When called with a message 'test'", () => {
    test("Then it should push said message with a timestamp in the store", () => {
      const message = "test";
      const {
        logMessage,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      logMessage(message);

      expect(current().logs).toStrictEqual([`[0] ${message}`]);

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.hasReachedLimit function", () => {
  describe("When called and the limit of items has been reached", () => {
    test("Then it should return true", () => {
      const expectedResult = true;
      const itemsLimit = 3;

      const {
        postItem,
        hasReachedLimit,
        end: cleanUpEnd,
      } = SessionStore().init({
        ...mockSessionConfig,
        limit: {
          items: itemsLimit,
        },
      });

      expect(hasReachedLimit()).toBe(false);

      Array(itemsLimit)
        .fill(postItem)
        .forEach((post) => post(undefined, {}));

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });
  });

  describe("When called and the limit of pages has been reached", () => {
    test("Then it should return true", () => {
      const expectedResult = true;
      const pagesLimit = 3;

      const {
        nextPage,
        hasReachedLimit,
        end: cleanUpEnd,
      } = SessionStore().init({
        ...mockSessionConfig,
        offset: {
          page: 1,
        },
        limit: {
          page: pagesLimit,
        },
      });

      expect(hasReachedLimit()).toBe(false);

      Array(pagesLimit)
        .fill(nextPage)
        .forEach((next) => next(""));

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });

    test("It should return false if there is no page limit", () => {
      const expectedResult = false;
      const randomPageIncrease =
        Math.floor(Math.random() * 50) + (mockSessionConfig.offset.page ?? 0);

      const {
        nextPage,
        hasReachedLimit,
        end: cleanUpEnd,
      } = SessionStore().init({
        ...mockSessionConfig,
        limit: {
          page: 0,
        },
      });

      expect(hasReachedLimit()).toBe(false);

      Array(randomPageIncrease)
        .fill(nextPage)
        .forEach((next) => next(""));

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });
  });

  describe("When called but no limits have been reached", () => {
    test("Then it should return false", () => {
      const expectedResult = false;
      const pagesLimit = 10;
      const itemsLimit = 10;

      const {
        postItem,
        nextPage,
        hasReachedLimit,
        end: cleanUpEnd,
      } = SessionStore().init({
        ...mockSessionConfig,
        limit: {
          page: pagesLimit,
          items: itemsLimit,
        },
      });

      expect(hasReachedLimit()).toBe(false);

      nextPage("");
      postItem(undefined, {});

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });
  });
});

// UTILS

const postItems = (
  numberOfItems: number,
  body: Partial<DefaultItem>,
  postItem: (
    item: Omit<DefaultItem, "_meta"> | undefined,
    errorLog: Record<string, Error>,
    selector?: string,
  ) => void,
): void => {
  new Array(numberOfItems).fill(body).forEach((item) => {
    postItem(item as DefaultItem, {});
  });
};
