import t from "../i18n";
import Puppeteer, {
  PUPPETEER_DEFAULT_OPTIONS,
  imageRequestHandler,
} from "./Puppeteer";

const mockEmit = jest.fn();
const mockLaunch = jest.fn();
const mockOn = jest.fn();
const mockSetUserAgent = jest.fn();

const mockAbort = jest.fn();
const mockContinue = jest.fn();

const mockHandlerRequest = {
  resourceType: () => "image",
  abort: () => mockAbort(),
  continue: () => mockContinue(),
};

const mockPage = {
  on: (...args: unknown[]) => mockOn(...args),
  setUserAgent: (...args: unknown[]) => mockSetUserAgent(...args),
};

const mockPuppeteer = {
  launch: (...args: unknown[]) => mockLaunch(...args),
};

jest.mock("../helpers/EventBus", () => ({
  emit: (...args: unknown[]) => mockEmit(...args),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Given a Puppeteer function", () => {
  describe("When called", () => {
    test("If everything goes right, it should return a Puppeteer Page", async () => {
      mockLaunch.mockResolvedValue({
        newPage: () => mockPage,
      });

      const page = await Puppeteer(mockPuppeteer, {
        userAgent: undefined,
        abortImages: false,
      });

      expect(page).toBe(mockPage);
      expect(mockEmit).not.toHaveBeenCalled();
    });

    test("It should be called with the default options if none passed", async () => {
      mockLaunch.mockResolvedValue({
        newPage: () => mockPage,
      });

      await Puppeteer(mockPuppeteer);

      expect(mockLaunch).toHaveBeenCalledTimes(1);
      expect(mockLaunch).toHaveBeenCalledWith({
        headless: PUPPETEER_DEFAULT_OPTIONS.headless,
        executablePath: PUPPETEER_DEFAULT_OPTIONS.executablePath,
        ignoreDefaultArgs: PUPPETEER_DEFAULT_OPTIONS.ignoreDefaultArgs,
      });
    });

    test("If it goes wrong, it should emit an error and return nothing", async () => {
      const error = new Error("test");
      mockLaunch.mockRejectedValue(error);

      const result = await Puppeteer(mockPuppeteer, {
        userAgent: undefined,
        abortImages: false,
      });

      expect(mockEmit).toHaveBeenCalledWith("SESSION:ERROR", error, {
        name: t("error_index.init"),
        publicMessage: t("scraper.puppeteer.error"),
        isCritical: true,
      });
      expect(result).toBeUndefined();
    });
  });

  describe("When called with a user agent", () => {
    test("Then it should set the passed user agent", async () => {
      mockLaunch.mockResolvedValue({
        newPage: () => mockPage,
      });

      await Puppeteer(mockPuppeteer, { userAgent: "test" });

      expect(mockSetUserAgent).toHaveBeenCalledTimes(1);
      expect(mockSetUserAgent).toHaveBeenCalledWith("test");
    });
  });

  describe("When called with an abort images option", () => {
    test("Then the image request handler should be called", async () => {
      mockLaunch.mockResolvedValue({
        newPage: () => mockPage,
      });

      await Puppeteer(mockPuppeteer, { abortImages: true });

      expect(mockOn).toHaveBeenCalledWith("request", imageRequestHandler);
    });
  });
});

describe("Given an imageRequestHandler function", () => {
  describe("When called with a request handler", () => {
    test("Then it should abort the request if the resource is an image", async () => {
      await imageRequestHandler({
        ...mockHandlerRequest,
        resourceType: () => "image",
      });

      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockContinue).not.toHaveBeenCalled();
    });

    test("Then it should continue with the request if the resource is not an image", async () => {
      await imageRequestHandler({
        ...mockHandlerRequest,
        resourceType: () => "text",
      });

      expect(mockContinue).toHaveBeenCalledTimes(1);
      expect(mockAbort).not.toHaveBeenCalled();
    });
  });
});
