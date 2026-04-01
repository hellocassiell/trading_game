export function resolvePreferredStarTab(
  tabs: string[],
  tabByUserId: Record<string, string>,
  preferredUserId: string,
  preferredTab: string,
  currentTab: string
): string {
  if (!tabs.length) {
    return "";
  }

  const tabFromUserId = preferredUserId ? tabByUserId[preferredUserId] : "";
  if (tabFromUserId && tabs.includes(tabFromUserId)) {
    return tabFromUserId;
  }
  if (preferredTab && tabs.includes(preferredTab)) {
    return preferredTab;
  }
  if (currentTab && tabs.includes(currentTab)) {
    return currentTab;
  }
  return tabs[0];
}
