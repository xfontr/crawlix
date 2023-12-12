import SessionConfig from "./SessionConfig";

interface SessionData extends SessionConfig {
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
}

export default SessionData;
