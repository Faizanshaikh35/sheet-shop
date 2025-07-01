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
  'https://www.googleapis.com/auth/userinfo.email' // Add this scope
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

// In your google service file
export async function createNewSpreadsheet(googleConnector, title: string) {
  oauth2Client.setCredentials({
    access_token: googleConnector.accessToken,
    refresh_token: googleConnector.refreshToken,
    expiry_date: googleConnector.expiryDate
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    // Create the spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title || 'Shopify Data'
        }
      }
    });

    // Get the shareable URL
    const fileId = spreadsheet.data.spreadsheetId;
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'writer',
        type: 'anyone'
      }
    });

    const file = await drive.files.get({
      fileId,
      fields: 'webViewLink'
    });

    return {
      spreadsheetId: fileId,
      url: file.data.webViewLink
    };
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

export async function syncProductsToSpreadsheet(tokens: any, products: any[], existingSheetUrl?: string){
  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  let spreadsheetId: string;

  // Check if we need to create a new sheet
  if (!existingSheetUrl) {
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Shopify Products'
        }
      }
    });
    spreadsheetId = spreadsheet.data.spreadsheetId!;
  } else {
    // Extract ID from URL (format: https://docs.google.com/spreadsheets/d/{ID}/edit)
    spreadsheetId = existingSheetUrl.split('/')[5];
  }
  // Prepare data for Google Sheets
  const values = [
    ['ID', 'Title', 'Description', 'Price'], // Headers
    ...products.map(product => [
      product.id,
      product.title,
      product.description,
      product.price
    ])
  ];

  // Clear existing data and write new data
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: 'A1:Z1000'
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: {
      values
    }
  });

  // Format header row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
              }
            },
            fields: "userEnteredFormat(textFormat,backgroundColor)"
          }
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 4
            }
          }
        }
      ]
    }
  });

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };

}
