import { Session, useAction } from "../../..";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import setDefaultTools from "../setDefaultTools";

describe("Given a setDefaultTools function", () => {
  describe("When called with a session and action hooks", () => {
    test("Then it should return all the basic scraping tools", () => {
      const session = Session(mockSessionConfig).init();
      const actions = useAction(mockSessionConfig.taskLength);

      const expectedResult = JSON.stringify({
        abort: (abrupt = true) => session.end(abrupt),
        store: session.store,
        hooks: {
          ...session.storeHooks,
          saveAsJson: session.saveAsJson,
          notify: session.notify,
          logError: session.error,
          $$a: actions.$$a,
          $a: actions.$a,
        },
      });

      const result = JSON.stringify(setDefaultTools(session, actions));

      expect(result).toStrictEqual(expectedResult);

      session.end();
    });
  });

  describe("When called with session and action hooks, and called its abort function", () => {
    test("Then it should end the session abruptly", () => {
      const session = Session(mockSessionConfig).init();
      const actions = useAction(mockSessionConfig.taskLength);

      const { abort } = setDefaultTools(session, actions);

      const { success } = abort()!;

      expect(success).toBe(false);

      session.end();
    });

    test("Then it should end the session successfully if instructed as so", () => {
      const session = Session(mockSessionConfig).init();
      const actions = useAction(mockSessionConfig.taskLength);

      const { abort } = setDefaultTools(session, actions);

      const { success } = abort(false)!;

      expect(success).toBe(true);

      session.end();
    });
  });
});
