import { UUID } from "crypto";
import t from "../../i18n";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import SessionData from "../../types/SessionData";
import SessionStore from "../SessionStore";
import { mockItemWithoutMeta } from "../../test-utils/mocks/mockItem";
import CreateError from "../../utils/CreateError";
import type { Item, ItemExtraAttributes } from "../../..";
import useItem from "../useItem";
import { ItemMeta } from "../../types/Item";

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
        useLoggers,
      } = SessionStore().init(mockSessionConfig);

      expect(current()).toStrictEqual(expectedStore);
      expect(mockOn).toHaveBeenCalledWith("ACTION:COUNT", countAction);
      expect(mockOn).toHaveBeenCalledWith(
        "SESSION:LOG",
        useLoggers().logMessage,
      );

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

      const { end, useItem } = SessionStore().init(mockSessionConfig);

      postItems(
        expectedIncompleteItems,
        { name: "Test", surname: undefined },
        useItem({ autoLogErrors: true }).setAttributes,
      );

      const { incompleteItems, totalItems } = end();

      expect(incompleteItems).toBe(expectedIncompleteItems);
      expect(totalItems).toBe(expectedIncompleteItems);
    });

    test("It should set success as 'false' if the relative minimum of items wasn't reached", () => {
      const incompleteItems = 3;
      const completeItems = 2;

      const { end, useItem } = SessionStore().init({
        ...mockSessionConfig,
        minimumItemsToSuccess: 0.5,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        useItem({ autoLogErrors: true }).setAttributes,
      );
      postItems(
        completeItems,
        { name: "Test", surname: "Test" },
        useItem().setAttributes,
      );

      expect(end().success).toBe(false);
    });

    test("It should set success as 'true' if the relative minimum of items was reached", () => {
      const incompleteItems = 3;
      const completeItems = 3;

      const { end, useItem } = SessionStore().init({
        ...mockSessionConfig,
        limit: { items: 10 },
        minimumItemsToSuccess: 0.5,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        useItem().setAttributes,
      );
      postItems(
        completeItems,
        { name: "Test", surname: "Test" },
        useItem().setAttributes,
      );

      expect(end().success).toBe(true);
    });

    test("It should set success as 'false' if the absolute minimum of items was not reached", () => {
      const incompleteItems = 10;
      const completeItems = 2;

      const { end, useItem } = SessionStore().init({
        ...mockSessionConfig,
        limit: { items: 15 },
        minimumItemsToSuccess: 3,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        useItem({ autoLogErrors: true }).setAttributes,
      );
      postItems(
        completeItems,
        { name: "Test", surname: "Test" },
        useItem().setAttributes,
      );

      expect(end().success).toBe(false);
    });

    test("It should set success as 'true' if the absolute minimum of items was reached", () => {
      const incompleteItems = 10;
      const completeItems = 3;

      const { end, useItem } = SessionStore().init({
        ...mockSessionConfig,
        limit: { items: 15 },
        minimumItemsToSuccess: 3,
      });

      postItems(
        incompleteItems,
        { name: "Test", surname: undefined },
        useItem({ autoLogErrors: true }).setAttributes,
      );
      postItems(
        completeItems,
        { name: "Test", surname: "Test" },
        useItem().setAttributes,
      );

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
        useLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      useLocation().updateLocation({ page });

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
        useLocation,
        current,
        end: cleanUpEnd,
      } = SessionStore().init(mockSessionConfig);

      useLocation().updateLocation({ url });

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
        useLocation,
        current,
      } = SessionStore().init(mockSessionConfig);

      useLocation().nextPage(url);

      const currentStore = current();

      expect(currentStore.location.url).toBe(url);
      expect(currentStore.location.page).toBe(expectedPage);
      expect(currentStore.history).toStrictEqual(expectedHistory);

      cleanUpEnd();
    });

    test("Then it should increase the current page and end the session if it reached its limit", () => {
      const { end: cleanUpEnd, useLocation } = SessionStore().init({
        ...mockSessionConfig,
        limit: { page: 1 },
      });

      useLocation().nextPage();

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
        useLocation,
        current,
      } = SessionStore().init(mockSessionConfig);

      useLocation().nextPage();

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
        useLocation,
        current,
      } = SessionStore().init({
        ...mockSessionConfig,
        offset: { ...mockSessionConfig.offset, page: initialPage },
      });

      useLocation().previousPage(url);

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
        useLocation,
        current,
      } = SessionStore().init({
        ...mockSessionConfig,
        offset: { ...mockSessionConfig.offset, page: initialPage },
      });

      useLocation().previousPage();
      useLocation().previousPage();

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
        useLocation,
        current,
      } = SessionStore().init(mockSessionConfig);

      useLocation().nextPage();

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
        useLoggers,
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

      useLoggers().logError(error, expectedLog.isCritical);

      expect(current().errorLog).toStrictEqual([expectedLog]);

      cleanUpEnd();
    });

    test("Then it should update the usage data with the last error, if the feature is on", () => {
      const {
        end: cleanUpEnd,
        useLoggers,
        current,
      } = SessionStore().init({ ...mockSessionConfig, usageData: true });

      const firstError = CreateError(new Error("test"));
      const secondError = CreateError(new Error("test-2"));

      useLoggers().logError(firstError);
      useLoggers().logError(secondError);

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
      const { end: cleanUpEnd, useLoggers } = SessionStore().init({
        ...mockSessionConfig,
        usageData: false,
      });

      const error = CreateError(Error("test"));

      useLoggers().logError(error);

      expect(mockUsageDataLogError).not.toHaveBeenCalled();

      cleanUpEnd();
    });
  });

  describe("When called with a non critical error", () => {
    test("Then it should register the error with the current session data", () => {
      const {
        current,
        end: cleanUpEnd,
        useLoggers,
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

      useLoggers().logError(error, expectedLog.isCritical);

      expect(current().errorLog).toStrictEqual([expectedLog]);

      cleanUpEnd();
    });
  });
});

describe("Given a SessionStore.postItem function", () => {
  describe("When called with an item", () => {
    test("Then it should post said item with its corresponding meta data", () => {
      const advancedTime = 10;
      const itemUrl = "test";

      const {
        useItem,
        end: cleanUpEnd,
        current,
        useLocation,
      } = SessionStore().init(mockSessionConfig);

      useLocation().nextPage(itemUrl);

      jest.advanceTimersByTime(advancedTime);

      const expectedMeta: { _meta: ItemMeta } = {
        _meta: {
          id: "random-uuid" as UUID,
          itemNumber: 0,
          page: mockSessionConfig.offset.page! + 1,
          posted: new Date(),
          moment: advancedTime,
          complete: true,
          errorLog: {},
          url: itemUrl,
        },
      };

      useItem().setAttributes(mockItemWithoutMeta).use();

      const item = current().items[0];

      expect({ ...item, _meta: undefined }).toStrictEqual({
        ...mockItemWithoutMeta,
        _meta: undefined,
      });
      expect(item?._meta).toStrictEqual(expectedMeta._meta);
      expect(current().totalItems).toBe(1);

      cleanUpEnd();
    });

    test("Then it should do nothing if the maximum amount of items was reached", () => {
      const {
        useItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init({ ...mockSessionConfig, limit: { items: 0 } });

      useItem().setAttributes(mockItemWithoutMeta).use();

      expect(current().items).toHaveLength(0);

      cleanUpEnd();
    });

    test("Then it should post the item and call off the session if there are too many items", () => {
      const {
        useItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init({ ...mockSessionConfig, limit: { items: 1 } });

      useItem().setAttributes(mockItemWithoutMeta).use();

      expect(current().totalItems).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith("SESSION:ACTIVE", false);
      expect(mockEmit).toHaveBeenCalledTimes(1);

      cleanUpEnd();
    });

    describe("When called with no item", () => {
      test("Then it mark the item as incomplete", () => {
        const {
          useItem,
          end: cleanUpEnd,
          current,
        } = SessionStore().init(mockSessionConfig);

        useItem({ autoLogErrors: true }).setAttributes({}).use();

        expect(current().items[0]?._meta.complete).toBe(false);

        cleanUpEnd();
      });
    });
  });

  describe("When called with an incomplete item", () => {
    test("Then it should mark the item as incomplete", () => {
      const {
        useItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      useItem({ autoLogErrors: true })
        .setAttributes({ name: "test", surname: undefined, age: undefined })
        .use();

      expect(current().items[0]?._meta.complete).toBe(false);

      cleanUpEnd();
    });
  });

  describe("When called with an error log", () => {
    test("Then it should register said log", () => {
      const {
        useItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      const errorLog = {
        surname: "Selector not found",
        age: "Selector not found",
      };

      useItem()
        .setAttributes({ name: "test", surname: undefined, age: undefined })
        .addErrors(errorLog)
        .use();

      expect(current().items[0]?._meta.errorLog).toStrictEqual(errorLog);

      cleanUpEnd();
    });
  });

  describe("When called with no item and no errorLog", () => {
    test("Then it should register all the meta data, but no item", () => {
      const {
        useItem,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      useItem().setAttributes({}).addErrors({}).use();

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
        useLoggers,
        end: cleanUpEnd,
        current,
      } = SessionStore().init(mockSessionConfig);

      useLoggers().logMessage(message);

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
        useItem,
        hasReachedLimit,
        end: cleanUpEnd,
      } = SessionStore().init({
        ...mockSessionConfig,
        limit: {
          items: itemsLimit,
        },
      });

      expect(hasReachedLimit()).toBe(false);

      const { setAttributes } = useItem();

      Array(itemsLimit)
        .fill(undefined)
        .forEach(() => setAttributes({}).use());

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });
  });

  describe("When called and the limit of pages has been reached", () => {
    test("Then it should return true", () => {
      const expectedResult = true;
      const pagesLimit = 3;

      const {
        useLocation,
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
        .fill(useLocation().nextPage)
        .forEach((next) => next(""));

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });

    test("It should return false if there is no page limit", () => {
      const expectedResult = false;
      const randomPageIncrease =
        Math.floor(Math.random() * 50) + (mockSessionConfig.offset.page ?? 0);

      const {
        useLocation,
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
        .fill(useLocation().nextPage)
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
        useItem,
        useLocation,
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

      useLocation().nextPage("");
      useItem().setAttributes({}).use();

      expect(hasReachedLimit()).toBe(expectedResult);

      cleanUpEnd();
    });
  });
});

// UTILS

const postItems = <T extends ItemExtraAttributes = ItemExtraAttributes>(
  numberOfItems: number,
  body: Item<T>,
  setAttributes: ReturnType<typeof useItem>["setAttributes"],
): void => {
  new Array(numberOfItems).fill(body).forEach((item: Item<T>) => {
    setAttributes(item).use();
  });
};
