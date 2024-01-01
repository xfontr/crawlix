import t from "../../i18n";
import CustomError, { CustomErrorProps } from "../../types/CustomError";
import CreateError from "../CreateError";

const mockError = () => new Error("test");

describe("Given a CreateError function", () => {
  describe("When called with an error and all the custom error data", () => {
    test("Then it should return a full custom error", () => {
      const errorProps: CustomErrorProps = {
        name: "test-name",
        publicMessage: "test-public-message",
      };

      const error = CreateError(mockError(), errorProps);

      expect(error.name).toBe(errorProps.name);
      expect(error.publicMessage).toBe(errorProps.publicMessage);
      expect(error.message).toBe(mockError().message);
    });
  });

  describe("When called with an error and no name", () => {
    test("Then it should set the default error name", () => {
      const error = CreateError(mockError());

      expect(error.name).toBe(mockError().name);
    });

    test("Then it should set an unknown error name if there is no default name either", () => {
      const currentMockError = mockError();
      currentMockError.name = "";

      const error = CreateError(currentMockError);

      expect(error.name).toBe(t("misc.unknown_error"));
    });
  });

  describe("When called with an error and no public message", () => {
    test("Then it should set the passed error public message", () => {
      const currentMockError = mockError() as CustomError;
      currentMockError.publicMessage = "test-public-message";

      const error = CreateError(currentMockError);

      expect(error.publicMessage).toBe(currentMockError.publicMessage);
    });

    test("Then it should set the default error message, if it has no public message", () => {
      const error = CreateError(mockError());

      expect(error.publicMessage).toBe(mockError().message);
    });
  });

  describe("When called with anything but an error", () => {
    test("Then it should anyways create a custom error with an unknown message", () => {
      const error = CreateError("error" as unknown as Error);

      expect(error.message).toBe(t("misc.unknown_error"));
      expect(error.publicMessage).toBe(t("misc.unknown_error"));
    });
  });
});
