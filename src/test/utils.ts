import * as _ from "lodash";

/**
 * Remove leading and trailing whitespace, replace multiple whitespace with a
 * single space, and remove whitespace between HTML tags.
 * @param html
 * @returns
 */

export const normalizeHtml = (html: string): string => {
  return _.chain(html)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*(<[^>]*>)\s*/g, "$1")
    .value();
};
