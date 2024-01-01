import { type SentMessageInfo, createTransport } from "nodemailer";
import type { SessionConfig } from "../..";
import type EmailContent from "../types/EmailContent";
import { warningMessage } from "../logger";
import t from "../i18n";
import { objectValues, tryCatch } from "@personal/utils";
import ENVIRONMENT from "../configs/environment";

const Email = (
  options?: NonNullable<SessionConfig["emailing"]> | undefined,
) => {
  if (!options) return () => [undefined, undefined];

  const optionsPassed = objectValues(options).filter((value) => !!value).length;
  const incompleteAuthData = optionsPassed > 0 && optionsPassed < 5;

  if (incompleteAuthData)
    return () => {
      warningMessage(t("email.auth.incomplete"));
      return [undefined, Error(t("email.auth.incomplete"))];
    };

  const transporter = createTransport({
    host: options.host,
    auth: {
      user: options.user,
      pass: options.password,
    },
    port: options.port,
    pool: true,
    secure: ENVIRONMENT.nodeEnv === "test" ? false : true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  return async ({
    subject,
    text,
  }: EmailContent): Promise<[SentMessageInfo, void | Error]> =>
    await tryCatch(transporter.sendMail.bind(transporter), {
      from: options.user,
      to: options.receiverEmail,
      subject,
      text,
    });
};

export default Email;
