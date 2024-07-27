import { writeFile } from "fs/promises";
import useAction from "./hooks/useAction";
import useApp from "./hooks/useApp";
import useSession from "./hooks/useSession";
import { resolve } from "path";

const save = true;

const experiment = async () => {
  useApp().setUp();
  const { afterAll, loop } = useSession().init();
  const { $a } = useAction();
  const { _dangerouslyAbort } = useApp();

  afterAll(async (output) => {
    if (save) {
      await writeFile(
        resolve(__dirname, "test-run.json"),
        JSON.stringify(output, null, 4),
        "utf-8",
      );
    }
  });

  await $a(
    () => {
      console.log("first action");
    },
    { name: "FIRST ACTION" },
  );

  await loop(
    async () => {
      await $a(
        async () => {
          console.log("second action");
          await $a(
            () => {
              console.log("third action");
            },
            { name: "THIRD INNER LOOP ACTION" },
          );
        },
        { name: "INNER LOOP ACTION" },
      );
    },
    (index) => index === 2,
  );

  _dangerouslyAbort();
};

void experiment();
