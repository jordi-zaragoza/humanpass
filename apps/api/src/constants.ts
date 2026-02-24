export const SESSION_COOKIE_NAME = "session";
export const SHORT_CODE_LENGTH = 8;
export const LINK_TTL_SECONDS = 60; // 1 minute
export const SESSION_TTL_SECONDS = LINK_TTL_SECONDS;

/** AAGUIDs of known virtual/emulator authenticators. */
export const BLOCKED_AAGUIDS: ReadonlySet<string> = new Set([
  "01020304-0506-0708-0102-030405060708", // softtoken (Firefox WebAuthn emulator)
  "6028b017-b1d4-4c02-b4b3-afcdafc96bb2", // Windows Hello software emulator
  "309956ce-203b-4561-aeb7-1a9e745c4c7d", // VirtualFIDO
]);
