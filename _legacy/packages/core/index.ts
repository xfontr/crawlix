// Import functions
import Session from "./src/helpers/Session";
import Scraper from "./src/services/Scraper";
import Email from "./src/helpers/Email";
import useAction from "./src/utils/useAction";
import Puppeteer from "./src/api/Puppeteer";

// Import types
import type { FullItem, Item, ItemExtraAttributes } from "./src/types/Item";
import SessionConfig, {
  type SessionConfigInit,
} from "./src/types/SessionConfig";
import type SessionData from "./src/types/SessionData";
import type CreateError from "./src/utils/CreateError";
import type ScraperSpeed from "./src/types/ScraperSpeed";
import EmailContent, { type EmailRequest } from "./src/types/EmailContent";
import type CustomError from "./src/types/CustomError";
import type Events from "./src/types/Events";
import type ScraperTool from "./src/types/ScraperTool";

// Export functions
export { Session, useAction, Scraper, Email, CreateError };

// Export types
export type {
  FullItem,
  Item,
  ItemExtraAttributes,
  SessionConfig,
  SessionData,
  ScraperSpeed,
  EmailContent,
  EmailRequest,
  CustomError,
  Events,
  ScraperTool as ScraperTools,
  SessionConfigInit,
  Puppeteer,
};
