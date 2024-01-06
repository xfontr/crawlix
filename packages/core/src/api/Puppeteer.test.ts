import t from "../i18n";
import Puppeteer from "./Puppeteer";

const mockEmit = jest.fn();
const mockLaunch = jest.fn();

const mockPuppeteer = {
  launch: (...args: unknown[]) => mockLaunch(...args),
};

jest.mock("../helpers/EventBus", () => ({
  emit: (...args: unknown[]) => mockEmit(...args),
}));

describe("Given a Puppeteer function", () => {
  describe("When called", () => {
    test("If everything goes right, it should return a Puppeteer Page", async () => {
      const mockPage = "page";
      mockLaunch.mockResolvedValue({
        newPage: () => mockPage,
      });

      const page = await Puppeteer(mockPuppeteer);

      expect(page).toBe(mockPage);
      expect(mockEmit).not.toHaveBeenCalled();
    });

    test("If it goes wrong, it should emit an error and return nothing", async () => {
      const error = new Error("test");
      mockLaunch.mockRejectedValue(error);

      const result = await Puppeteer(mockPuppeteer);

      expect(mockEmit).toHaveBeenCalledWith("SESSION:ERROR", error, {
        name: t("error_index.init"),
        publicMessage: t("scraper.puppeteer.error"),
        isCritical: true,
      });
      expect(result).toBeUndefined();
    });
  });
});
