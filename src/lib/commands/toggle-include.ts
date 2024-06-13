import { surroundSelection } from "../editorHelpers";

const wordMatch: string = "[A-Za-z\\u00C0-\\u017F]";
const toggleUIControlPattern: RegExp = new RegExp(
  "{{$include " + wordMatch + "}}"
);

export function toggleInclude() {
  return surroundSelection("{{$include ", "}}", toggleUIControlPattern);
}
