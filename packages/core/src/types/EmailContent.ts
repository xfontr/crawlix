/**
 * @param "FULL_SESSION": Sends the entire session data
 * @param "CRITICAL_ERROR": Sends the error that broke the session, if any
 * @param "ITEMS": Sends the items scraped
 * @param "SUCCESS_OR_ERROR": Informs whether the session ended successfully or not.
 * Includes the breaking error, if any
 */
export type EmailRequest =
  | "FULL_SESSION"
  | "CRITICAL_ERROR"
  | "ITEMS"
  | "SUCCESS_OR_ERROR";

export interface EmailContent {
  subject: string;
  text: string;
  /**
   * @description If true, the email is sent even if it has no content.
   * @default false
   */
  sendIfEmpty?: boolean;
}

export default EmailContent;
