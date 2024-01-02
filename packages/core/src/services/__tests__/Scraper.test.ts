jest.mock("puppeteer", () => ({}));

describe("Given a Scraper.run function", () => {
  describe("When called with a callback that is longer than the global timeout", () => {
    test("Then it should cut the callback and return an 'ABRUPT_ENDING' text", async () => {});
  });

  describe("When called with a callback that is shorter than the global timeout", () => {
    test("Then it should return the callback returned value", async () => {});

    test("Then it should go to the default page and end the store", async () => {});
  });

  describe("When called twice", () => {
    test("Then it should do nothing the second time and return undefined", () => {});
  });
});

describe("Given a Scraper.afterAll function", () => {
  describe("When called", () => {
    test("Then it should send a message indicating the afterAll functions begun", async () => {});

    test("Then it should do nothing and return undefined if it's the second time it was called", async () => {});
  });

  describe("When called with a callback that is longer than the afterAll timeout", () => {
    test("Then it should cut the callback and return an 'ABRUPT_ENDING' text", async () => {});
  });

  describe("When called with a callback that is shorter than the afterAll timeout", () => {
    test("Then it should return the callback returned value", async () => {});
  });
});
