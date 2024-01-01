import { randomUUID } from "crypto";
import { SessionData } from "../../..";
import mockSessionConfig from "./mockSessionConfig";
import { mockItem } from "./mockItem";

const mockSessionData: SessionData = {
  ...mockSessionConfig,
  _id: randomUUID(),
  duration: 0,
  endDate: new Date(),
  startDate: new Date(),
  errorLog: [],
  history: ["www.test.com"],
  incompleteItems: 0,
  items: [{ ...mockItem }],
  location: {
    page: 3,
    url: "www.test.com",
  },
  success: true,
  totalActions: 3,
  totalActionsJointLength: 60,
  totalItems: 1,
  emailing: {
    host: "tst.mail.test",
    password: "test-password",
    port: 465,
    receiverEmail: "test@test.com",
    user: "user-test@test.com",
  },
  logs: [],
};

export default mockSessionData;
