import A from "./projects/A/A";

/* ################################################################## */
/* # Update this to get started ##################################### */
/* ##########.####################################################### */
/* ##########.####################################################### */
/* ##########.####################################################### */
/* ##########········>> */ const PROJECT = A; /* <<········########## */
/* ################################################################## */
/* ################################################################## */
/* ################################################################## */
/* ################################################################## */

void (async <T extends () => Promise<object>>(project: T) => {
  await project();
  process.exit(0);
})(PROJECT);
