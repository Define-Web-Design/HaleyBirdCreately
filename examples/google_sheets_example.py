
import os
import sys
import json
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# Add the server directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# If modifying these scopes, delete the token.json file if it exists
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def get_credentials():
    """Gets valid user credentials from storage or initiates OAuth2 flow."""
    creds = None
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_info(json.load(open('token.json')), SCOPES)
    
    # If credentials don't exist or are invalid, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Check if credentials.json exists
            if not os.path.exists('credentials.json'):
                print("⚠️ credentials.json file not found")
                print("You need to create a project in Google Cloud Console and download credentials")
                print("Visit https://developers.google.com/sheets/api/quickstart/python for instructions")
                return None
                
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    return creds

def read_spreadsheet(spreadsheet_id, range_name):
    """Reads data from a Google Spreadsheet."""
    creds = get_credentials()
    if not creds:
        return None
        
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    try:
        result = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
        values = result.get('values', [])
        
        if not values:
            print('No data found.')
            return []
            
        return values
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def write_to_spreadsheet(spreadsheet_id, range_name, values):
    """Writes data to a Google Spreadsheet."""
    # Update SCOPES to include write permission
    creds = get_credentials()
    if not creds:
        return False
        
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    body = {
        'values': values
    }
    
    try:
        result = sheet.values().update(
            spreadsheetId=spreadsheet_id, 
            range=range_name,
            valueInputOption='USER_ENTERED',
            body=body).execute()
        print(f"{result.get('updatedCells')} cells updated.")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def main():
    print("Google Sheets Python Example")
    print("----------------------------")
    
    # Example 1: Reading from a spreadsheet
    print("\n--- Example 1: Reading from a Spreadsheet ---")
    spreadsheet_id = input("Enter your Spreadsheet ID: ")
    range_name = input("Enter range (e.g., 'Sheet1!A1:E10'): ")
    
    data = read_spreadsheet(spreadsheet_id, range_name)
    if data:
        print("\nData retrieved:")
        for row in data:
            print(row)
    
    # Example 2: Creating a new sheet and writing data
    should_write = input("\nDo you want to write data to the spreadsheet? (yes/no): ")
    if should_write.lower() == 'yes':
        print("\n--- Example 2: Writing to a Spreadsheet ---")
        
        # Sample data to write
        values = [
            ["Name", "Email", "Color Preference"],
            ["Alice", "alice@example.com", "Blue"],
            ["Bob", "bob@example.com", "Green"],
            ["Charlie", "charlie@example.com", "Purple"]
        ]
        
        write_range = input("Enter range to write to (e.g., 'Sheet2!A1'): ")
        success = write_to_spreadsheet(spreadsheet_id, write_range, values)
        if success:
            print("Data written successfully!")

if __name__ == "__main__":
    main()
