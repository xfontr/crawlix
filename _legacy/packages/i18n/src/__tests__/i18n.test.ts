import i18n from "../i18n";
import { syncTryCatch } from "../i18n.utils";

/**
 * TEST PENDING
 */
describe("Given a i18n function", () => {
  describe("When called with default options", () => {
    test("Then it should work :)", () => {
      const [_, unexpectedError] = syncTryCatch(i18n);

      expect(unexpectedError).toBeUndefined();
    });
  });
});
