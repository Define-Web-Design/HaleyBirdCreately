
import os
import json
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class GoogleSheetsService:
    def __init__(self, credentials_path=None, token_path=None):
        """Initialize Google Sheets service with either service account or OAuth credentials"""
        self.service = None
        self.credentials_path = credentials_path
        self.token_path = token_path
        
        # If specific paths not provided, use environment variables or defaults
        if not self.credentials_path:
            self.credentials_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', 'credentials.json')
        
        if not self.token_path:
            self.token_path = os.environ.get('GOOGLE_OAUTH_TOKEN_PATH', 'token.json')
        
        # Initialize the service
        self._init_service()
    
    def _init_service(self):
        """Initialize the Google Sheets service"""
        try:
            # Try to use service account first (server-to-server auth)
            if os.path.exists(self.credentials_path) and self.credentials_path.endswith('.json'):
                with open(self.credentials_path, 'r') as f:
                    cred_data = json.load(f)
                    
                # Check if it's a service account key
                if 'type' in cred_data and cred_data['type'] == 'service_account':
                    credentials = service_account.Credentials.from_service_account_file(
                        self.credentials_path,
                        scopes=['https://www.googleapis.com/auth/spreadsheets']
                    )
                    self.service = build('sheets', 'v4', credentials=credentials)
                    return
            
            # Fall back to user credentials if available
            if os.path.exists(self.token_path):
                with open(self.token_path, 'r') as token:
                    creds = Credentials.from_authorized_user_info(json.load(token))
                    if creds and creds.valid:
                        self.service = build('sheets', 'v4', credentials=creds)
                        return
            
            # If we get here, we couldn't initialize the service
            print("Failed to initialize Google Sheets service. Ensure valid credentials are available.")
            
        except Exception as e:
            print(f"Error initializing Google Sheets service: {str(e)}")
    
    def read_range(self, spreadsheet_id, range_name):
        """Read data from a spreadsheet range"""
        if not self.service:
            print("Google Sheets service not initialized.")
            return None
            
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            return result.get('values', [])
            
        except HttpError as error:
            print(f"Error reading from spreadsheet: {error}")
            return None
    
    def write_range(self, spreadsheet_id, range_name, values, value_input_option='USER_ENTERED'):
        """Write data to a spreadsheet range"""
        if not self.service:
            print("Google Sheets service not initialized.")
            return False
            
        try:
            body = {
                'values': values
            }
            
            result = self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption=value_input_option,
                body=body
            ).execute()
            
            return result
            
        except HttpError as error:
            print(f"Error writing to spreadsheet: {error}")
            return False
    
    def append_values(self, spreadsheet_id, range_name, values, value_input_option='USER_ENTERED'):
        """Append values to a spreadsheet"""
        if not self.service:
            print("Google Sheets service not initialized.")
            return False
            
        try:
            body = {
                'values': values
            }
            
            result = self.service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption=value_input_option,
                body=body
            ).execute()
            
            return result
            
        except HttpError as error:
            print(f"Error appending to spreadsheet: {error}")
            return False
    
    def create_spreadsheet(self, title, sheets=None):
        """Create a new spreadsheet with optional sheets configuration"""
        if not self.service:
            print("Google Sheets service not initialized.")
            return None
            
        try:
            spreadsheet_body = {
                'properties': {
                    'title': title
                }
            }
            
            if sheets:
                spreadsheet_body['sheets'] = sheets
                
            spreadsheet = self.service.spreadsheets().create(body=spreadsheet_body).execute()
            
            return spreadsheet.get('spreadsheetId')
            
        except HttpError as error:
            print(f"Error creating spreadsheet: {error}")
            return None

# Example usage
if __name__ == "__main__":
    # Initialize the service
    sheets_service = GoogleSheetsService()
    
    # Example: Read data from a spreadsheet
    spreadsheet_id = "YOUR_SPREADSHEET_ID"
    range_name = "Sheet1!A1:D5"
    
    data = sheets_service.read_range(spreadsheet_id, range_name)
    if data:
        print("Data retrieved:")
        for row in data:
            print(row)
