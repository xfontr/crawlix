import { UUID } from "crypto";
import SessionConfig from "./SessionConfig";
import CustomError from "./CustomError";
import { FullItem, ItemExtraAttributes } from "./Item";

interface SessionData<T extends ItemExtraAttributes = ItemExtraAttributes>
  extends SessionConfig {
  /**
   * @description Session's ID in UUID format
   */
  _id: UUID;
  /**
   * @description Session start date
   */
  startDate: Date;
  /**
   * @description Session end date
   */
  endDate: Date;
  /**
   * @description Session length in ms
   */
  duration: number;
  /**
   * @description Total amount of actions executed by the scraper
   */
  totalActions: number;
  /**
   * @description Total base time, in ms, consumed by the scraper actions, not including the timeouts
   * (totalActions * taskLength * speed)
   */
  totalActionsJointLength: number;
  /**
   * @description Current location of the script, meaning the page it's at and the item is scraping
   */
  location: Required<SessionConfig["offset"]>;
  /**
   * @description Counter of actually scraped items
   */
  totalItems: number;
  /**
   * @description Scraped items
   */
  items: FullItem<T>[];
  /**
   * @description History of accessed URLs
   */
  history: string[];
  /**
   * @description History of registered errors, including critical and non-critical ones
   */
  errorLog: {
    /**
     * @description Date and time the error was caught at
     */
    date: Date;
    /**
     * @description Moment of the session where the error happened, counted in milliseconds
     */
    moment: number;
    /**
     * @description If critical, the app will break
     */
    isCritical: boolean;
    /**
     * @description Error object
     */
    error: CustomError;
    /**
     * @description Page and item where the error was found
     */
    location: SessionConfig["offset"] & { itemNumber: number };
    /**
     * @description The total count of actions at the moment of the error
     */
    actionNumber: number;
  }[];
  /**
   * @description Whether the session was abruptly ended before successfully finishing
   */
  success: boolean;
  /**
   * @description Number of items which data was not fulfilled as expected
   */
  incompleteItems: number;
  /**
   * @description All the logs printed in the console during the session
   */
  logs: `[${number}] ${string}`[];
}

export default SessionData;
