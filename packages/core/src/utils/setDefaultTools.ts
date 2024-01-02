import { Session, useAction } from "../..";

const setDefaultTools = (
  $s: ReturnType<typeof Session>,
  { $a, $$a }: ReturnType<typeof useAction>,
) => ({
  abort: (abrupt = true) => $s.end(abrupt),
  store: $s.store,
  hooks: {
    ...$s.storeHooks,
    saveAsJson: $s.saveAsJson,
    notify: $s.notify,
    $$a,
    $a,
  },
});

export default setDefaultTools;
