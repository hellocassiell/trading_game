import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

test("language bootstrap is seeded from server layout cookie state", () => {
  const layoutSource = readSource("app/layout.tsx");
  const providerSource = readSource("components/LanguageProvider.tsx");

  assert.equal(
    layoutSource.includes("<LanguageProvider initialLanguage={initialLanguage}>"),
    true,
    "Root layout should pass server-derived initialLanguage into LanguageProvider"
  );
  assert.equal(
    providerSource.includes("const [storedLanguage, setStoredLanguage] = useState<AppLanguage>(initialLanguage);"),
    true,
    "LanguageProvider should seed client state from the server-derived language"
  );
});

test("app frame receives server-seeded auth state for protected-route shell rendering", () => {
  const layoutSource = readSource("app/layout.tsx");
  const appFrameSource = readSource("components/AppFrame.tsx");

  assert.equal(
    layoutSource.includes("<AppFrame initialLoggedIn={initialLoggedIn}>"),
    true,
    "Root layout should pass server-derived auth state into AppFrame"
  );
  assert.equal(
    appFrameSource.includes("initialLoggedIn"),
    true,
    "AppFrame should use server-seeded auth state instead of relying only on localStorage during first render"
  );
});

test("hydration-sensitive pages avoid browser-only render initializers", () => {
  const guestPage = readSource("app/guest/page.tsx");
  const invitePage = readSource("app/auth/invite/page.tsx");
  const assistantResultsPage = readSource("app/assistant/results/page.tsx");

  assert.equal(
    guestPage.includes("const initialState = readGuestInitialState();"),
    false,
    "Guest page should not derive browser state during render"
  );
  assert.equal(
    invitePage.includes("const initialState = readInviteInitialState();"),
    false,
    "Invite page should not derive browser state during render"
  );
  assert.equal(
    assistantResultsPage.includes("const [keyword] = useState(readInitialKeyword);"),
    false,
    "Assistant results page should not read window search params in useState initializer"
  );
});

test("trade ticket reset effect does not depend on unstable preset object identity", () => {
  const source = readSource("components/TradeTicketCard.tsx");

  assert.equal(
    source.includes("[product, startWithSearch, variant, orderStatus, initialStage, orderPreset]"),
    false,
    "TradeTicketCard should not reset on every render because orderPreset is a new object each time"
  );
});
