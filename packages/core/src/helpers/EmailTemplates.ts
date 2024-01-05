import { SessionData } from "../..";
import t from "../i18n";
import EmailContent, { EmailRequest } from "../types/EmailContent";

const EmailTemplates = (
  store: SessionData,
): Record<EmailRequest, () => EmailContent> => ({
  FULL_SESSION: () => ({
    subject: t("email.subject.full_session"),
    text: JSON.stringify(store),
    sendIfEmpty: true,
  }),
  CRITICAL_ERROR: () => ({
    subject: t("email.subject.critical_error"),
    text: JSON.stringify(store.errorLog.find(({ isCritical }) => isCritical)),
    sendIfEmpty: false,
  }),
  ITEMS: () => ({
    subject: t("email.subject.items"),
    text: store.items.length ? JSON.stringify(store.items) : "",
    sendIfEmpty: false,
  }),
  SUCCESS_OR_ERROR: () => ({
    subject: t(
      store.success ? "email.subject.success" : "email.subject.failure",
    ),
    text: store.success
      ? t("email.subject.success")
      : JSON.stringify(store.errorLog.find(({ isCritical }) => isCritical)),
    sendIfEmpty: true,
  }),
});

export default EmailTemplates;
