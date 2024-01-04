import { Session, useAction } from "../..";

// TODO: Pending tests
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
    logError: $s.error,
    $$a,
    $a,
  },
});

export default setDefaultTools;
