/* eslint-disable @typescript-eslint/require-await */
import useAction from "./hooks/useAction";
import useApp from "./hooks/useApp";
import useSession from "./hooks/useSession";
// import EventBus from "./utils/EventBus";

const experiment = async () => {
  useApp().setUp();
  const { afterAll } = useSession().init();
  const { $a } = useAction();
  const { _dangerouslyAbort } = useApp();

  await $a(async (depth, index) => {
    console.log("ACTION", { depth, index });
    await new Promise(() => {
      throw new Error("penis");
    });
  });

  afterAll(() => {
    console.log("a");
  });

  _dangerouslyAbort();
};

void experiment();
