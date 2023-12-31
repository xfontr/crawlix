import { SessionData } from "../..";
import t from "../i18n";
import EmailContent, { EmailRequest } from "../types/EmailContent";

const EmailTemplates = (
  store: SessionData,
): Record<EmailRequest, () => EmailContent> => ({
  FULL_SESSION: () => ({
    subject: t("email.full_session"),
    text: JSON.stringify(store.items),
    sendIfEmpty: true,
  }),
  CRITICAL_ERROR: () => ({
    subject: t("email.critical_error"),
    text: JSON.stringify(store.errorLog.find(({ isCritical }) => isCritical)),
    sendIfEmpty: false,
  }),
  ITEMS: () => ({
    subject: t("email.items"),
    text: store.items.length ? JSON.stringify(store.items) : "",
    sendIfEmpty: false,
  }),
  SUCCESS_OR_ERROR: () => ({
    subject: t(store.success ? "email.success" : "email.failure"),
    text: store.success
      ? t("email.success")
      : JSON.stringify(store.errorLog.find(({ isCritical }) => isCritical)),
    sendIfEmpty: true,
  }),
});

export default EmailTemplates;
