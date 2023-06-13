import { getEol } from "../env";
import { surroundBlockSelection } from "../editorHelpers";

const newLine = getEol();

const startingAdministration: string = `>[!ADMIN]${newLine}>${newLine}>`;
const endingAdministration: string = newLine;
const administrationBlockWordPattern: RegExp = new RegExp(
  startingAdministration + ".+" + endingAdministration + "|.+",
  "gm"
);

export function toggleAdministration() {
  return surroundBlockSelection(
    startingAdministration,
    endingAdministration,
    administrationBlockWordPattern
  );
}
