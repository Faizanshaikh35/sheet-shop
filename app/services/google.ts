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

export async function syncProductsToSpreadsheet(
  tokens: any,
  products: any[],
  existingSheetUrl?: string
) {
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  // 1. Get or create spreadsheet
  let spreadsheetId: string;
  if (!existingSheetUrl) {
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'Shopify Products' }
      }
    });
    spreadsheetId = spreadsheet.data.spreadsheetId!;
  } else {
    spreadsheetId = existingSheetUrl.split('/')[5];
  }

  // 2. Get existing data from sheet
  let existingData: any[][] = [];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A2:D', // Skip header row
    });
    existingData = response.data.values || [];
  } catch (error) {
    console.log('No existing data found, starting fresh');
  }

  // 3. Create maps for comparison
  const sheetProductMap = new Map<string, any>();
  existingData.forEach(row => {
    if (row[0]) sheetProductMap.set(row[0], row);
  });

  const productMap = new Map<string, any>();
  products.forEach(product => {
    productMap.set(product.id, product);
  });

  // 4. Determine changes needed
  const updates: any[] = [];
  const newRows: any[][] = [];
  const updatedIds = new Set<string>();

  // Check for updates to existing products
  sheetProductMap.forEach((sheetRow, productId) => {
    const product = productMap.get(productId);
    if (product) {
      const sheetData = {
        title: sheetRow[1] || '',
        description: sheetRow[2] || '',
        price: sheetRow[3] || ''
      };

      const productData = {
        title: product.title || '',
        description: product.description || '',
        price: product.price || ''
      };

      if (JSON.stringify(sheetData) !== JSON.stringify(productData)) {
        updates.push({
          range: `A${existingData.findIndex(row => row[0] === productId) + 2}:D${existingData.findIndex(row => row[0] === productId) + 2}`,
          values: [[
            product.id,
            product.title,
            product.description,
            product.price
          ]]
        });
        updatedIds.add(productId);
      }
    }
  });

  // Check for new products
  productMap.forEach((product, productId) => {
    if (!sheetProductMap.has(productId)) {
      newRows.push([
        product.id,
        product.title,
        product.description,
        product.price
      ]);
    }
  });

  // 5. Execute updates in batch
  const requests = [];

  if (updates.length > 0) {
    requests.push({
      updateCells: {
        rows: updates.map(update => ({
          values: update.values[0].map(value => ({
            userEnteredValue: { stringValue: String(value) }
          }))
        })),
        fields: 'userEnteredValue',
        range: {
          sheetId: 0,
          startRowIndex: updates[0].range.match(/A(\d+)/)[1] - 1,
          endRowIndex: updates[0].range.match(/A(\d+)/)[1],
          startColumnIndex: 0,
          endColumnIndex: 4
        }
      }
    });
  }

  if (newRows.length > 0) {
    requests.push({
      appendCells: {
        sheetId: 0,
        rows: newRows.map(row => ({
          values: row.map(value => ({
            userEnteredValue: { stringValue: String(value) }
          }))
        })),
        fields: 'userEnteredValue'
      }
    });
  }

  // 6. Format headers if new sheet or first sync
  if (existingData.length === 0) {
    requests.push(
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
    );

    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['ID', 'Title', 'Description', 'Price']]
      }
    });
  }

  // Execute all batch requests
  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    stats: {
      updated: updates.length,
      added: newRows.length,
      unchanged: products.length - updates.length - newRows.length
    }
  };
}
