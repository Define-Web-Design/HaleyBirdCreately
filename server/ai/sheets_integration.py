
import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import json

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

class GoogleSheetsService:
    def __init__(self):
        """Initialize the Google Sheets service."""
        self.creds = None
        self.service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Sheets API."""
        # Check if credentials file exists
        if not os.path.exists('credentials.json'):
            raise ValueError("credentials.json file not found. Please download from Google Cloud Console.")
            
        # The file token.json stores the user's access and refresh tokens
        if os.path.exists('token.json'):
            self.creds = Credentials.from_authorized_user_info(
                json.loads(open('token.json').read()), SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                self.creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open('token.json', 'w') as token:
                token.write(self.creds.to_json())
        
        self.service = build('sheets', 'v4', credentials=self.creds)
    
    def get_sheet_data(self, spreadsheet_id, range_name):
        """Get data from a specified range in a Google Spreadsheet."""
        if not self.service:
            self._authenticate()
            
        sheet = self.service.spreadsheets()
        result = sheet.values().get(spreadsheetId=spreadsheet_id,
                                   range=range_name).execute()
        values = result.get('values', [])
        return values
    
    def get_sheets(self, spreadsheet_id):
        """Get all sheet names in a Google Spreadsheet."""
        if not self.service:
            self._authenticate()
            
        sheet = self.service.spreadsheets()
        result = sheet.get(spreadsheetId=spreadsheet_id).execute()
        return [sheet['properties']['title'] for sheet in result['sheets']]
    
    def get_color_palettes(self, spreadsheet_id, range_name="Sheet1!A1:F100"):
        """Extract color palettes from a spreadsheet assuming color data format."""
        data = self.get_sheet_data(spreadsheet_id, range_name)
        palettes = []
        
        if not data:
            return palettes
            
        # Try to detect color palette data
        # Assumes columns might contain hex codes or RGB values
        for row in data[1:]:  # Skip header row
            palette = {}
            
            # If there are at least 2 columns and the first might be a name/label
            if len(row) >= 2:
                palette["name"] = row[0]
                colors = []
                
                # Check remaining columns for potential hex codes or rgb values
                for col in row[1:]:
                    col = col.strip()
                    # Simple check if it might be a hex code
                    if (col.startswith('#') and len(col) in [4, 7]) or \
                       (col.lower().startswith('rgb') or col.lower().startswith('hsl')):
                        colors.append(col)
                
                if colors:
                    palette["colors"] = colors
                    palettes.append(palette)
        
        return palettes
    
    def generate_color_report(self, spreadsheet_id, range_name="Sheet1!A1:F100"):
        """Generate a report about colors found in a spreadsheet."""
        data = self.get_sheet_data(spreadsheet_id, range_name)
        
        if not data:
            return {"status": "No data found", "rows": 0, "color_count": 0}
            
        color_count = 0
        hex_colors = []
        
        for row in data:
            row_str = ' '.join(row).lower()
            for cell in row:
                cell = cell.strip()
                # Check for hex colors
                if cell.startswith('#') and len(cell) in [4, 7]:
                    color_count += 1
                    hex_colors.append(cell)
                # Check for RGB format
                elif 'rgb(' in cell.lower() and ')' in cell:
                    color_count += 1
        
        return {
            "status": "Success",
            "rows": len(data),
            "color_count": color_count,
            "hex_colors": hex_colors[:10]  # Return first 10 hex colors as sample
        }

# Export default instance
sheets_service = GoogleSheetsService()

# Example usage
if __name__ == "__main__":
    try:
        service = GoogleSheetsService()
        SAMPLE_SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'  # Sample ID
        sample_data = service.get_sheet_data(SAMPLE_SPREADSHEET_ID, 'Sheet1!A1:D5')
        print(sample_data)
    except ValueError as e:
        print(f"Error: {e}")
        print("Please set up credentials.json before using this module.")
