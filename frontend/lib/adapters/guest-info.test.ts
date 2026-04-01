import test from "node:test";
import assert from "node:assert/strict";

import {
  GUEST_INFO_MODAL_KEYS,
  isGuestInfoModalParam,
  resolveGuestInfoModalFromQuery,
  getGuestInfoModalViewModels,
} from "./guest-info.ts";

test("guest info modal models cover all guest landing entries", () => {
  const modals = getGuestInfoModalViewModels("zh-Hans");

  assert.deepEqual(Object.keys(modals), GUEST_INFO_MODAL_KEYS);
  assert.equal(modals.seasonPrize.sections.length > 0, true);
  assert.equal(modals.videoIntro.sections.length > 0, true);
  assert.equal(modals.competitionRules.sections.length > 0, true);
});

test("competition rules modal keeps HK trading constraints visible", () => {
  const rules = getGuestInfoModalViewModels("zh-Hant").competitionRules;
  const allRows = rules.sections.flatMap((section) => [
    ...(section.rows ?? []),
    ...(section.accentRows ?? []),
  ]);

  assert.equal(allRows.some((row) => row.includes("09:30-12:00、13:00-16:00")), true);
  assert.equal(allRows.some((row) => row.includes("T+2")), true);
  assert.equal(allRows.some((row) => row.includes("20 筆")), true);
});

test("guest info query resolver accepts only known modal keys", () => {
  assert.equal(isGuestInfoModalParam("season-prize"), true);
  assert.equal(isGuestInfoModalParam("video-intro"), true);
  assert.equal(isGuestInfoModalParam("competition-rules"), true);
  assert.equal(isGuestInfoModalParam("blocked"), false);
  assert.equal(resolveGuestInfoModalFromQuery("video-intro"), "videoIntro");
  assert.equal(resolveGuestInfoModalFromQuery("unknown"), null);
});
