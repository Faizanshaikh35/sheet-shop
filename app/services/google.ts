import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.GOOGLE_REDIRECT_URI}`
);

// Only two scopes: Sheets & Drive
const scope = [
  "https://www.googleapis.com/auth/spreadsheets", // Google Sheets (read/write)
  "https://www.googleapis.com/auth/drive",       // Google Drive (read/write)
];

export const generateAuthUrl = () => {
  const state = Math.random().toString(36).substring(2);
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Required for refresh tokens
    scope,
    state,
    prompt: "consent",      // Ensures user sees permissions screen
  });
};
