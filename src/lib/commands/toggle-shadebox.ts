import { surroundBlockSelection, surroundSelection } from "../editorHelpers";
import { getEol } from "../env";

const newLine = getEol();
const blankLine = newLine + newLine;

const startingBlock: string = ">[!BEGINSHADEBOX]" + blankLine;
const endingBlock: string = blankLine + ">[!ENDSHADEBOX]" + newLine;
export function toggleShadebox() {
    return surroundBlockSelection(
    startingBlock,
    endingBlock
  );
}
