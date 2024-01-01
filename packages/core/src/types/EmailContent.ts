export type EmailRequest =
  | "FULL_SESSION"
  | "CRITICAL_ERROR"
  | "ITEMS"
  | "SUCCESS_OR_ERROR";

export interface EmailContent {
  subject: string;
  text: string | undefined;
  /**
   * @description If true, the email is sent even if it has no content.
   * @default false
   */
  sendIfEmpty?: boolean;
}

export default EmailContent;
