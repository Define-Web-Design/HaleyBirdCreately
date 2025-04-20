
# Setting Up Google Sheets API

To use the Google Sheets API with your Python application, follow these steps:

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a name for your project and click "Create"
4. Select your new project from the dropdown menu

## 2. Enable the Google Sheets API

1. Go to the [API Library](https://console.cloud.google.com/apis/library)
2. Search for "Google Sheets API"
3. Click on "Google Sheets API" in the results
4. Click "Enable"

## 3. Create Credentials

### For server-to-server applications (Service Account):

1. Go to the [Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" and select "Service Account"
3. Fill in the service account details and click "Create"
4. Grant the service account access to the project (Role: "Editor" is usually sufficient)
5. Click "Done"
6. Find your new service account in the list, click on the email address
7. Go to the "Keys" tab
8. Click "Add Key" → "Create new key"
9. Choose JSON format and click "Create"
10. The JSON key file will be downloaded to your computer
11. Rename this file to `credentials.json` and place it in your project directory

### For user-based authentication (OAuth):

1. Go to the [Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" and select "OAuth client ID"
3. If prompted, configure the consent screen (External is fine for testing)
4. For application type, choose "Desktop app"
5. Enter a name for your OAuth client
6. Click "Create"
7. Download the JSON file
8. Rename the file to `credentials.json` and place it in your project directory

## 4. Share Spreadsheets with Service Account

If you're using a service account, you'll need to share any spreadsheets you want to access with the service account email address (found in the credentials.json file).

1. Open the Google Sheet you want to access
2. Click the "Share" button
3. Enter the service account's email address
4. Choose the appropriate permission level (Editor if you need to write)
5. Click "Send"

## 5. Set Environment Variables (Optional)

For improved security, you can set these environment variables instead of keeping the credentials file in your project:

```bash
# For service account authentication
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"

# For OAuth authentication
export GOOGLE_OAUTH_CLIENT_ID="your-client-id"
export GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
export GOOGLE_OAUTH_REFRESH_TOKEN="your-refresh-token"
```

## 6. Test Your Setup

Run the example scripts provided in the `examples` directory to verify your setup:

```bash
python examples/google_sheets_example.py
```

If everything is set up correctly, you should be able to read from and write to your Google Sheets!
