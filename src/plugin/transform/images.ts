import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

function centerFirstImage(token: Token) {
  if (!token?.children) {
    return;
  }
  const imageToken = token.children.find((child) => child.type === "image");
  if (imageToken) {
    const imageIndex = token.children.indexOf(imageToken);
    const startToken = new Token("html_block", "", 0);
    startToken.content = "<div style='text-align:center;'>";
    const endToken = new Token("html_block", "", 0);
    endToken.content = "</div>";
    token.children.splice(imageIndex, 0, startToken);
    token.children.splice(imageIndex + 2, 0, endToken);
  }
}

/**
 * Extracts attributes from an image token and modifies the token accordingly.
 *
 * @param {Token} token - The image token to extract attributes from.
 * @returns {Array} An empty array.
 */
function extractAttributes(token: Token) {
  // Regular expression to match the image syntax
  const regex = /\!\[(.+?)\]\((.*)\)/;

  // Find a match in the token content
  const match = token.content.match(regex);

  // If no match is found, return early
  if (!match) {
    return;
  }

  // Ensure that the token has children
  if (!token.children) {
    return;
  }

  // Find the text child within the token
  const textChild = token.children.find((child) => child.type === "text");

  // If no text child is found, return early
  if (!textChild) {
    return;
  }

  // Regular expression to match the attributes within curly braces
  const propsRegex = /\{(.+?)\}/;

  // Find a match in the text child content
  const propsMatch = textChild.content.match(propsRegex);

  // If no match is found, return early
  if (!propsMatch) {
    return;
  }

  // Extract the string inside the curly braces
  const propsString = propsMatch[1];

  // Split the string into an array of key-value pairs
  const propsArray = propsString.split(" ");

  // Reduce the array into an array of key-value pairs
  const textProps = propsArray.reduce<[string, string][]>((arr, prop) => {
    // Split the key-value pair into an array
    const [key, value] = prop.split("=");

    // If the key is "align" and the value is "right"
    if (
      key.toLowerCase() === "align" &&
      value.toLowerCase().replace(/"/g, "") === "right"
    ) {
      // Add a style attribute to align the image to the right
      arr.push(["style", "float: right; margin-left: 10px;"]);
    } else {
      // Add the key-value pair as is
      arr.push([key, value.replace(/"/g, "")]);
    }

    return arr;
  }, []);

  // Find the image child within the token
  const imageChild = token.children.find((child) => child.type === "image");

  // If textProps, imageChild, and imageChild.attrs are all defined
  if (textProps && imageChild && imageChild.attrs) {
    // Add the textProps to the imageChild's attrs array
    imageChild.attrs.push(...textProps);
  }

  // Remove the text child from the token
  token.children = token.children.filter((child) => child.type !== "text");

  // Return an empty array
  return [];
}

export function transformImages(state: StateCore) {
  let tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token?.type !== TokenType.INLINE) {
      continue;
    }
    if (token?.children && token?.children[0]?.type === TokenType.IMAGE) {
      extractAttributes(token);
    }
  }
}
