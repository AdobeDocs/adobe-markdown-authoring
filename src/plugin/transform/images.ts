import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

function extractAttributes(token: Token): void {
  if (!token.content || !token.children) return;

  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)\s*(\{[^}]+\})?/;
  const match = token.content.match(imageRegex);
  if (!match) return;

  const [fullMatch, , , propsString] = match;
  if (!propsString) return;

  const attrs = parseAttributes(propsString.slice(1, -1));

  const imageChild = token.children.find((child) => child.type === "image");

  if (imageChild && imageChild.attrs) {
    imageChild.attrs.push(...attrs);
  }

  // Remove the attribute text from the main token's content
  token.content = token.content.replace(propsString, "");

  // Find and remove the text child containing only the attributes
  const attrTextChildIndex = token.children.findIndex(
    (child) => child.type === "text" && child.content === propsString
  );
  if (attrTextChildIndex !== -1) {
    token.children.splice(attrTextChildIndex, 1);
  }

  // Handle the text child containing the image syntax
  const textChild = token.children.find(
    (child) =>
      child.type === "text" &&
      child.content &&
      child.content.includes(fullMatch)
  );

  if (textChild && textChild.content) {
    // Split the content into parts: before image and after image
    const [beforeImage, ...afterImageParts] =
      textChild.content.split(fullMatch);
    let afterImage = afterImageParts
      .join(fullMatch)
      .replace(propsString, "")
      .trim();

    // Update the existing text child with content before the image
    if (beforeImage) {
      textChild.content = beforeImage;
    } else {
      // If there's no text before the image, remove this text child
      token.children = token.children.filter((child) => child !== textChild);
    }

    // If there's any content after the image syntax (excluding the alignment markup),
    // create a new text child for it
    if (afterImage) {
      const newTextChild = new Token("text", "", 0);
      newTextChild.content = afterImage;
      const imageIndex = token.children.findIndex(
        (child) => child.type === "image"
      );
      if (imageIndex !== -1) {
        token.children.splice(imageIndex + 1, 0, newTextChild);
      }
    }
  }
}

function parseAttributes(propsString: string): [string, string][] {
  const attrs: [string, string][] = [];
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let match;

  while ((match = regex.exec(propsString)) !== null) {
    const [, key, value1, value2, value3] = match;
    const value = value1 || value2 || value3;

    if (key.toLowerCase() === "align") {
      attrs.push(["style", getAlignStyle(value)]);
    } else {
      attrs.push([key.toLowerCase(), value]);
    }
  }

  return attrs;
}

function getAlignStyle(align: string): string {
  switch (align.toLowerCase()) {
    case "left":
      return "float: left; margin-right: 10px;";
    case "right":
      return "float: right; margin-left: 10px;";
    case "center":
      return "display: block; margin: 0 auto;";
    default:
      return "";
  }
}

export function transformImages(state: StateCore): void {
  let tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token?.type !== TokenType.INLINE) {
      continue;
    }
    if (token?.children) {
      const imageChild = token.children.find(
        (child) => child.type === TokenType.IMAGE
      );
      if (imageChild) {
        extractAttributes(token);
      }
    }
  }
}
