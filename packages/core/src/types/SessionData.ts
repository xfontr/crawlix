import { UUID } from "crypto";
import SessionConfig from "./SessionConfig";
import DefaultItem from "./DefaultItem";

interface SessionData<
  T extends Record<string, string | number | object> = Record<
    string,
    string | number | object
  >,
> extends SessionConfig {
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
  items: DefaultItem<T>[];
  /**
   * @description History of accessed URLs
   */
  history: string[];
  /**
   * @description History of registered errors, including critical and non-critical ones
   */
  errorLog: {
    /**
     * Moment the error was caught at
     */
    time: Date;
    /**
     * @description If critical, the app will break
     */
    isCritical: boolean;
    /**
     * @description Error object with its message and stack
     */
    error: Error;
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
}

export default SessionData;
