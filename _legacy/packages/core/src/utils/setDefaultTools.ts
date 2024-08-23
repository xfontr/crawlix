import { Session, useAction } from "../..";

const setDefaultTools = (
  $s: ReturnType<typeof Session>,
  { $a, $$a }: ReturnType<typeof useAction>,
) => ({
  abort: (abrupt = true) => $s.end(abrupt),
  store: $s.store,
  ...$s.hooks,
  useAction: { $a, $$a },
});

export default setDefaultTools;
