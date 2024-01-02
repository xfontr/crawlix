import { ElementHandle, Page } from "puppeteer";
import { Session } from "../../..";
import ScraperTools from "../ScraperTools";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";

const mockEmit = jest.fn();

jest.mock("../../utils/EventBus", () => ({
  emit: (...args: unknown[]) => mockEmit(...args),
  on: () => undefined,
  removeAllListeners: () => undefined,
}));

const mockGoto = jest.fn();
const mockEval = jest.fn();

const mockPage = {
  goto: async (...args: unknown[]) => await mockGoto(...args),
} as Page;

const mockParent = {
  $eval: (...args: unknown[]) => mockEval(...args),
} as ElementHandle<Element>;

const newSession = () =>
  Session({ ...mockSessionConfig, offset: { url: "www.test.com" } }).init();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given a ScraperTools.goToPage function", () => {
  describe("When called with no params", () => {
    test("Then it should go to the default offset url", async () => {
      mockGoto.mockResolvedValue(true);

      const $s = newSession();
      const { goToPage, abort } = ScraperTools($s, mockPage, {});

      const response = await goToPage();

      expect(mockGoto).toHaveBeenCalledWith("www.test.com");
      expect(response).toStrictEqual([true, undefined]);

      abort();
    });
  });

  describe("When called with a specific url", () => {
    test("Then it should go to said url", async () => {
      mockGoto.mockResolvedValue(true);
      const testPage = "www.test-2.com";

      const $s = newSession();
      const { goToPage, abort } = ScraperTools($s, mockPage, {});

      const response = await goToPage(testPage);

      expect(mockGoto).toHaveBeenCalledWith(testPage);
      expect(response).toStrictEqual([true, undefined]);

      abort();
    });

    test("Then it should log a critical error if the navigation failed", async () => {
      const error = new Error("test");
      mockGoto.mockRejectedValue(error);

      const $s = newSession();
      const { goToPage, abort } = ScraperTools($s, mockPage, {});

      const response = await goToPage();

      expect(mockGoto).toHaveBeenCalled();
      expect(response).toStrictEqual([undefined, error]);

      // We have to manually abort despite the critical error, as the emits are mocked
      abort();
    });
  });
});

describe("Given a ScraperTools.getElement function", () => {
  describe("When called with a parent and a selector", () => {
    test("Then it should return the text content of the requested element", async () => {
      const selector = "selector";
      const textContent = "test";
      mockEval.mockResolvedValue(textContent);

      const $s = newSession();
      const { getElement, abort } = ScraperTools($s, mockPage, {});

      const response = await getElement(mockParent, selector);

      expect(mockEval).toHaveBeenCalled();
      expect(response).toStrictEqual([textContent, undefined]);

      abort();
    });

    test("Then it should log a non-critical error if getting the element failed", async () => {
      const error = new Error("test");
      const selector = "selector";
      mockEval.mockRejectedValue(error);

      const $s = newSession();
      const { getElement, abort } = ScraperTools($s, mockPage, {});

      const response = await getElement(mockParent, selector);

      expect(mockEval).toHaveBeenCalled();
      expect(response).toStrictEqual([undefined, error]);

      abort();
    });
  });
});
