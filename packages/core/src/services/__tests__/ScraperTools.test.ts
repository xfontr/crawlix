import { Page } from "puppeteer";
import { Session } from "../../..";
import ScraperTools from "../ScraperTools";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";

jest.mock("../../utils/EventBus", () => ({
  emit: () => undefined,
  on: () => undefined,
  removeAllListeners: () => undefined,
}));

const mockGoto = jest.fn();

const mockPage = {
  goto: async (...args: unknown[]) => await mockGoto(...args),
} as Page;

const newSession = () =>
  Session({ ...mockSessionConfig, offset: { url: "www.test.com" } }).init();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given ae ScraperTools.goToPage function", () => {
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

    test("Then it should log an error if the navigation failed", async () => {
      const error = new Error("test");
      mockGoto.mockRejectedValue(error);

      const $s = newSession();
      const { goToPage, abort } = ScraperTools($s, mockPage, {});

      const response = await goToPage();

      expect(mockGoto).toHaveBeenCalled();
      expect(response).toStrictEqual([undefined, error]);

      abort();
    });
  });
});
