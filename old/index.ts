import myLogger from "./proxier.init";

const log = myLogger({ currentPage: "Main" });

log.speak("Hello");

log.speak(log.publicStore.current.getBeforeResponse())