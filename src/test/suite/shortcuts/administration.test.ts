import { getEol } from "../../../lib/env";
import { testCommand } from "../shortcuts.test";

const NEWLINE = getEol();

suite("Admin Alerts", () => {
  test("Ranged selection", () => {
    return testCommand(
      "toggleAdministration",
      "«This is just a plain tip≥",
      "«>[!ADMIN]\n>\n>This is just a plain tip\n≥"
    );
  });

  test("Multiline ranged selection", () => {
    return testCommand(
      "toggleAdministration",
      "«This is just a" + NEWLINE + "plain tip≥",
      "«>[!ADMIN]\n>\n>This is just a\nplain tip\n≥"
    );
  });

  test("Multiline ranged selection with extra newline", () => {
    return testCommand(
      "toggleAdministration",
      "«This is just a" + NEWLINE + "plain tip≥" + NEWLINE,
      "«>[!ADMIN]\n>\n>This is just a\nplain tip\n≥"
    );
  });

  test("Multiline ranged selection while selecting extra newline", () => {
    return testCommand(
      "toggleAdministration",
      "«This is just a" + NEWLINE + "plain tip" + NEWLINE + "≥",
      "«>[!ADMIN]\n>\n>This is just a\nplain tip\n\n≥"
    );
  });

  test("Collapsed selection", () => {
    return testCommand(
      "toggleAdministration",
      "Just a plain tip•",
      "«>[!ADMIN]\n>\n>Just a plain tip\n≥"
    );
  });

  test("Toggles with ranged selection", () => {
    return testCommand(
      "toggleAdministration",
      "«This is just a plain tip≥",
      "«>[!ADMIN]\n>\n>This is just a plain tip\n≥"
    );
  });

  test("Toggles with multi-line ranged selection", () => {
    return testCommand(
      "toggleAdministration",
      "«This is just a" + NEWLINE + "plain tip≥",
      "«>[!ADMIN]\n>\n>This is just a\nplain tip\n≥"
    );
  });
});
