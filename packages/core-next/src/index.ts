import { writeFile } from "fs/promises";
import useAction from "./hooks/useAction";
import useApp from "./hooks/useApp";
import useSession from "./hooks/useSession";
import { resolve } from "path";
import process from "process";

const save = true;

const main = () => {
  useApp().setUp();
  const { afterAll } = useSession().init();

  process.nextTick(scrapeItems);
  // https://github.com/trevorr/async-cleanup/blob/master/src/index.ts
  afterAll(async (output) => {
    if (save) {
      await writeFile(
        resolve(__dirname, "test-run.json"),
        JSON.stringify(output, null, 4),
        "utf-8",
      );
    }
  });
};

const scrapeItem = async () => {
  const { $a } = useAction();

  await $a(
    () => {
      console.log("first action");
    },
    { name: "FIRST ACTION" },
  );
};

const scrapeItems = async () => {
  const { loop } = useSession();
  const { $a } = useAction();
  const { _dangerouslyAbort } = useApp();

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
          await scrapeItem();
        },
        { name: "INNER LOOP ACTION" },
      );
    },
    (index) => index === 2,
  );

  _dangerouslyAbort();
};

main();
