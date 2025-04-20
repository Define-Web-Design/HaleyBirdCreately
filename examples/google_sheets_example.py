
import os
import sys

# Add the server directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import json

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def get_credentials():
    """Get and return the user's credentials."""
    creds = None
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_info(
            json.loads(open('token.json').read()), SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    return creds

def get_spreadsheet_data(spreadsheet_id, range_name):
    """Get data from a Google Spreadsheet."""
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)
    
    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=spreadsheet_id,
                               range=range_name).execute()
    values = result.get('values', [])
    
    return values

def main():
    print("Google Sheets Python Example")
    print("---------------------------")
    
    # Check if credentials file exists
    if not os.path.exists('credentials.json'):
        print("⚠️ credentials.json file is not found")
        print("Please download your credentials.json from Google Cloud Console")
        print("Go to: https://console.cloud.google.com/apis/credentials")
        return
    
    # Example: Reading data from a spreadsheet
    try:
        # Replace with your Google Spreadsheet ID
        # The ID is the part of the URL after /d/ and before /edit
        # For example: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
        # The ID would be: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
        SPREADSHEET_ID = input("Enter your Google Spreadsheet ID: ")
        
        # The range to read (e.g., Sheet1!A1:B10)
        RANGE_NAME = input("Enter the range to read (e.g., Sheet1!A1:D10): ")
        
        # Get the data
        values = get_spreadsheet_data(SPREADSHEET_ID, RANGE_NAME)
        
        if not values:
            print('No data found.')
            return
            
        # Print the data
        print("\nData from your Google Sheet:")
        print("----------------------------")
        for row in values:
            print(', '.join(row))
            
        # Example: Analyzing the data
        print("\nData Analysis:")
        print("-------------")
        print(f"Number of rows: {len(values)}")
        if values and len(values) > 0:
            print(f"Number of columns: {len(values[0])}")
            
        # Example: Processing the data for color-related info (matching your app's theme)
        if values and len(values) > 0 and len(values[0]) > 1:
            print("\nLooking for color-related information...")
            color_related_rows = []
            for row in values:
                row_str = ' '.join(row).lower()
                if any(color_term in row_str for color_term in ['color', 'rgb', 'hex', 'palette']):
                    color_related_rows.append(row)
            
            if color_related_rows:
                print(f"Found {len(color_related_rows)} rows with color-related information:")
                for row in color_related_rows:
                    print('  - ' + ', '.join(row))
            else:
                print("No color-related information found in the data.")
                
    except Exception as e:
        print(f"Error: {e}")
        print("Please make sure you have the correct permissions and valid spreadsheet ID.")

if __name__ == '__main__':
    main()
