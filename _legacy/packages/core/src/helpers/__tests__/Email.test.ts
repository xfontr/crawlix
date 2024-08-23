import { getTestMessageUrl } from "nodemailer";
import Email from "../Email";
import ENVIRONMENT from "../../configs/environment";
import t from "../../i18n";
import SESTransport from "nodemailer/lib/ses-transport";
import CustomError from "../../types/CustomError";
import CreateError from "../../utils/CreateError";

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

      const expectedResponse = [
        undefined,
        CreateError(Error(t("email.error.incomplete"))),
      ];

      const response = await sendEmail({ subject: "", text: "" });

      expect(response).toStrictEqual(expectedResponse);
      expect((response[1] as CustomError).publicMessage).toBe(
        t("email.error.incomplete"),
      );
    });
  });

  describe("When called with complete options", () => {
    /**
     * If no internet connection, this test will fail.
     * Also, make sure the test .env variables are correctly set,
     * based on the ethereal email log in credentials
     */

    test("Then it should send an email and return the response if it went alright", async () => {
      const sendEmail = Email({
        host: ENVIRONMENT.test.email.host,
        user: ENVIRONMENT.test.email.user,
        password: ENVIRONMENT.test.email.password,
        port: ENVIRONMENT.test.email.port,
        receiverEmail: ENVIRONMENT.email.receiverEmail!,
      });

      const [emailResult, noError] = await sendEmail({
        subject: "test",
        text: "test",
      });

      const mockEmailUrl = getTestMessageUrl(
        emailResult as SESTransport.SentMessageInfo,
      );

      expect(mockEmailUrl).not.toBe(false);
      expect(noError).toBeUndefined();
      expect(
        (mockEmailUrl as string).startsWith("https://ethereal.email/message/"),
      ).toBe(true);
    }, 10_000);

    test("Then it should try to send the email and return the error if it fails", async () => {
      const sendEmail = Email({
        host: "test",
        user: "test@test.com",
        password: "test",
        port: 465,
        receiverEmail: "test@test.com",
      });

      const [response, error] = await sendEmail({
        subject: "test",
        text: "test",
      });

      expect(response).toBeUndefined();
      expect((error as CustomError).publicMessage).toBe(
        t("email.error.sending_failed"),
      );
    });
  });
});
