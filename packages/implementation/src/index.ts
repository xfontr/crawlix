import CL from "./projects/CL";
import HL from "./projects/HL";

void (async (project: typeof CL | typeof HL) => {
  await project();
})(HL);
