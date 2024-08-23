import { type SentMessageInfo, createTransport } from "nodemailer";
import type { SessionConfig } from "../..";
import type EmailContent from "../types/EmailContent";
import t from "../i18n";
import { objectValues, tryCatch } from "@personal/utils";
import ENVIRONMENT from "../configs/environment";
import CreateError from "../utils/CreateError";

const Email = (
  options?: NonNullable<SessionConfig["emailing"]> | undefined,
) => {
  if (!options) return () => [undefined, undefined];

  const optionsPassed = objectValues(options).filter((value) => !!value).length;
  const incompleteAuthData = optionsPassed > 0 && optionsPassed < 5;

  if (incompleteAuthData)
    return () => {
      return [undefined, CreateError(Error(t("email.error.incomplete")))];
    };

  const transporter = createTransport({
    host: options.host,
    auth: {
      user: options.user,
      pass: options.password,
    },
    port: options.port,
    pool: true,
    secure: ENVIRONMENT.nodeEnv !== "test",
    tls: {
      rejectUnauthorized: false,
    },
  });

  return async ({
    subject,
    text,
  }: EmailContent): Promise<[SentMessageInfo, void | Error]> => {
    const response = await tryCatch(transporter.sendMail.bind(transporter), {
      from: options.user,
      to: options.receiverEmail,
      subject,
      text,
    });

    response[1] = response[1]
      ? CreateError(response[1], {
          publicMessage: t("email.error.sending_failed"),
        })
      : response[1];

    return response;
  };
};

export default Email;
