import logger from "./logger";

const log = logger({ current: "TEST" });

/**
 * Prints: "TEST: Hello world"
 */
log.speak("Hello world");

/**
 * Prints: [ 'TEST:', 'Hello world' ]
 */
log.speak(log.superProxyStore.getMain());

/**
 * Prints: "Hello world" - It comes from the original object, thus skipping the proxy
 */
log.log("Hello world");

/**
 * Prints: { totalCount: 2, speak: 2, error: 0 } - Done by the analytics plugin
 */
log.speak(log.superProxyPlugins.getCounters());

/**
 * - Creates a txt file with a history of all the times the logger was used - Done by the analytics plugin
 * - Deletes the last txt file - Done by a custom close up function
 */
log.superProxyTerminate();
