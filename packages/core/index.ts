import Session from "./src/helpers/Session";
import ScraperTools from "./src/services/ScraperTools";
import Scraper from "./src/services/Scraper";
import Email from "./src/helpers/Email";
import useAction from "./src/utils/useAction";

import type DefaultItem from "./src/types/DefaultItem";
import type SessionConfig from "./src/types/SessionConfig";
import type SessionData from "./src/types/SessionData";
import type CreateError from "./src/utils/CreateError";
import type ScraperSpeed from "./src/types/ScraperSpeed";
import EmailContent, { type EmailRequest } from "./src/types/EmailContent";
import type CustomError from "./src/types/CustomError";
import type Events from "./src/types/Events";

export { Session, useAction, Scraper, ScraperTools, Email, CreateError };
export type {
  DefaultItem,
  SessionConfig,
  SessionData,
  ScraperSpeed,
  EmailContent,
  EmailRequest,
  CustomError,
  Events,
};
