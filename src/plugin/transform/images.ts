import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

function extractAttributes(token: Token) {
  const regex = /\[(.+?)\]\((.+?)\s(.*)\)/;
  const match = token.content.match(regex);
  if (!match) {
    return;
  }
  if (!token.children) {
    return;
  }
  // const title = match[3];
  const textChild = token.children.find((child) => child.type === "text");
  if (textChild) {
    const propsRegex = /\{(.+?)\}/;
    const propsMatch = textChild.content.match(propsRegex);

    if (propsMatch) {
      const propsString = propsMatch[1];
      const propsArray = propsString.split(" ");

      const textProps = propsArray.reduce<[string, string][]>((arr, prop) => {
        const [key, value] = prop.split("=");
        if (key.toLowerCase() === "align" && value.toLowerCase() === "center") {
          arr.push(["style", "display: block; margin: auto;"]);
        } else {
          arr.push([key, value.replace(/"/g, "")]);
        }
        return arr;
      }, []);
      const imageChild = token.children.find((child) => child.type === "image");
      if (textProps && imageChild && imageChild.attrs) {
        imageChild.attrs.push(...textProps);
      }
    }
  }

  token.children = token.children.filter((child) => child.type !== "text");

  return [];
}

export function transformImages(state: StateCore) {
  let tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type !== TokenType.INLINE) {
      continue;
    }
    if (token?.children && token.children[0].type === TokenType.IMAGE) {
      extractAttributes(token);
    }
  }
}
