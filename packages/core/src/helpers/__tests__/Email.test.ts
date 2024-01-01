import { getTestMessageUrl } from "nodemailer";
import Email from "../Email";
import ENVIRONMENT from "../../configs/environment";
import t from "../../i18n";
import SESTransport from "nodemailer/lib/ses-transport";

const mockWarningMessage = jest.fn();

jest.mock("../../logger.ts", () => ({
  warningMessage: (...args: unknown[]) => mockWarningMessage(...args),
}));

describe("Given an Email function", () => {
  describe("When called with no options", () => {
    test("Then it should return an empty function", () => {
      const response = Email()({ subject: "", text: "" });

      const expectedResponse = [undefined, undefined];

      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe("When called with incomplete options", () => {
    test("Then it should return an empty function with a warning message", async () => {
      const sendEmail = Email({
        host: "test",
        user: "test",
        password: "test",
        port: 1,
        receiverEmail: "",
      });

      const expectedResponse = [undefined, Error(t("email.auth.incomplete"))];

      const response = await sendEmail({ subject: "", text: "" });

      expect(mockWarningMessage).toHaveBeenCalledWith(
        t("email.auth.incomplete"),
      );
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe("When called with complete options", () => {
    /**
     * If no internet connection, this test will fail.
     * Also, make sure the test .env variables are correctly set,
     * based on the ethereal email log in credentials
     */

    test("Then it should send an email", async () => {
      const sendEmail = Email({
        host: ENVIRONMENT.test.email.host,
        user: ENVIRONMENT.test.email.user,
        password: ENVIRONMENT.test.email.password,
        port: ENVIRONMENT.test.email.port,
        receiverEmail: ENVIRONMENT.email.receiverEmail!,
      });

      const [emailResult] = await sendEmail({ subject: "test", text: "test" });

      const mockEmailUrl = getTestMessageUrl(
        emailResult as SESTransport.SentMessageInfo,
      );

      expect(mockEmailUrl).not.toBe(false);
      expect(
        (mockEmailUrl as string).startsWith("https://ethereal.email/message/"),
      ).toBe(true);
    });
  });
});
