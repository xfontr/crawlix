import { createTransport } from "nodemailer";
import { SessionConfig } from "../..";
import EmailContent from "../types/EmailContent";
import { warningMessage } from "../logger";
import t from "../i18n";
import { objectValues } from "@personal/utils";

const Email = (options: NonNullable<SessionConfig["emailing"]> | undefined) => {
  if (!options) return () => undefined;

  const optionsPassed = objectValues(options).filter((value) => !!value).length;
  const incompleteAuthData = optionsPassed > 0 && optionsPassed < 5;

  if (incompleteAuthData) {
    warningMessage(t("email.auth.incomplete"));
    return () => undefined;
  }

  const transporter = createTransport({
    host: options.host,
    auth: {
      user: options.user,
      pass: options.password,
    },
    port: options.port,
    pool: true,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify((error) => {
    if (!error) return;

    warningMessage(t("email.auth.fail"));
  });

  return async ({ subject, text }: EmailContent) => {
    await transporter.sendMail({
      from: options.user,
      to: options.receiverEmail,
      subject,
      text,
    });
  };
};

export default Email;
