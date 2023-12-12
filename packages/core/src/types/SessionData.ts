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
}

export default SessionData;
