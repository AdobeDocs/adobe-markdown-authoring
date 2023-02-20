import { surroundBlockSelection, surroundSelection } from "../editorHelpers";
import { getEol } from "../env";

const newLine = getEol();

const wordMatch: string = "[A-Za-z\\u00C0-\\u017F]";
const startingBlock: string = ">[!BEGINSHADEBOX]" + newLine;
const endingBlock: string = newLine + ">[!ENDSHADEBOX]";
const codeBlockWordPattern: RegExp = new RegExp(
  `${startingBlock}.+${endingBlock}|.+`,
  "gm"
);
export function toggleShadebox() {
  return surroundBlockSelection(
    startingBlock,
    endingBlock,
    codeBlockWordPattern
  );
}
