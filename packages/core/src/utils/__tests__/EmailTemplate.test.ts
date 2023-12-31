import { SessionData } from "../../..";
import t from "../../i18n";
import mockSessionData from "../../test-utils/mocks/mockSessionData";
import EmailContent from "../../types/EmailContent";
import EmailTemplates from "../EmailTemplates";

const mockError: SessionData["errorLog"][number] = {
  actionNumber: 1,
  date: new Date(),
  error: Error("test"),
  isCritical: true,
  location: {
    itemNumber: 1,
    page: 3,
    url: "www.test.com",
  },
  moment: 100,
};

describe("Given a EmailTemplates.FULL_SESSION function", () => {
  describe("When called", () => {
    test("Then it should return a subject and the store items", () => {
      const result = EmailTemplates(mockSessionData).FULL_SESSION();

      const expectedResult: EmailContent = {
        subject: t("email.full_session"),
        text: JSON.stringify(mockSessionData),
        sendIfEmpty: true,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });
});

describe("Given a EmailTemplates.CRITICAL_ERROR function", () => {
  describe("When called and the store has no errors", () => {
    test("Then it should return a subject and an empty text", () => {
      const result = EmailTemplates(mockSessionData).CRITICAL_ERROR();

      const expectedResult: EmailContent = {
        subject: t("email.critical_error"),
        text: undefined,
        sendIfEmpty: false,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe("When called and the store has one error", () => {
    test("Then it should return a subject and said error as text", () => {
      const result = EmailTemplates({
        ...mockSessionData,
        errorLog: [mockError],
      }).CRITICAL_ERROR();

      const expectedResult: EmailContent = {
        subject: t("email.critical_error"),
        text: JSON.stringify(mockError),
        sendIfEmpty: false,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });
});

describe("Given a EmailTemplates.ITEMS function", () => {
  describe("When called and the store has no items", () => {
    test("Then it should return a subject and an empty text", () => {
      const result = EmailTemplates({
        ...mockSessionData,
        items: [],
      }).ITEMS();

      const expectedResult: EmailContent = {
        subject: t("email.items"),
        text: "",
        sendIfEmpty: false,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe("When called and the store has items", () => {
    test("Then it should return a subject and the items as text", () => {
      const result = EmailTemplates(mockSessionData).ITEMS();

      const expectedResult: EmailContent = {
        subject: t("email.items"),
        text: JSON.stringify(mockSessionData.items),
        sendIfEmpty: false,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });
});

describe("Given a EmailTemplates.SUCCESS_OR_ERROR function", () => {
  describe("When called and the session was successful", () => {
    test("Then it should send a success message as subject and as text", () => {
      const result = EmailTemplates({
        ...mockSessionData,
        success: true,
      }).SUCCESS_OR_ERROR();

      const expectedResult: EmailContent = {
        subject: t("email.success"),
        text: t("email.success"),
        sendIfEmpty: true,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe("When called and the session failed", () => {
    test("Then it should send a fail message and the error as text", () => {
      const result = EmailTemplates({
        ...mockSessionData,
        errorLog: [mockError],
        success: false,
      }).SUCCESS_OR_ERROR();

      const expectedResult: EmailContent = {
        subject: t("email.failure"),
        text: JSON.stringify(mockError),
        sendIfEmpty: true,
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
