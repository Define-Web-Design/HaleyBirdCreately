
import os
import sys
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import json

# Add the server directory to the path so we can import modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# If modifying these scopes, delete the file token.json.
SCOPES = [
    'https://www.googleapis.com/auth/documents.readonly', 
    'https://www.googleapis.com/auth/drive.metadata.readonly'
]

def main():
    print("Google Drive and Docs Python Example")
    print("------------------------------------")
    
    # Check if credentials file is set
    if not os.path.exists('credentials.json'):
        print("⚠️ credentials.json file not found")
        print("Please download your credentials.json from Google Cloud Console")
        print("Setup instructions: https://developers.google.com/docs/api/quickstart/python")
        return
    
    # Get credentials and build service
    creds = None
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_info(json.load(open('token.json')))
    
    # If there are no valid credentials, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=3000)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    # Build the Drive API service
    drive_service = build('drive', 'v3', credentials=creds)
    
    # Example 1: Listing Google Docs from Drive
    print("\n--- Example 1: Listing Your Google Docs ---")
    
    try:
        # Call the Drive API to list files
        # Only get Google Docs files (mimeType filter)
        results = drive_service.files().list(
            pageSize=10,
            fields="nextPageToken, files(id, name, webViewLink)",
            q="mimeType='application/vnd.google-apps.document'"
        ).execute()
        
        items = results.get('files', [])
        
        if not items:
            print("No Google Docs files found.")
        else:
            print("Documents:")
            for item in items:
                print(f"• {item['name']} (ID: {item['id']})")
                if 'webViewLink' in item:
                    print(f"  URL: {item['webViewLink']}")
                
        # Example 2: Creating a Document
        print("\n--- Example 2: Reading a Document ---")
        
        if items:
            # Build the Docs API service
            docs_service = build('docs', 'v1', credentials=creds)
            
            # Use the first document from our list as an example
            doc_id = items[0]['id']
            doc_name = items[0]['name']
            
            print(f"Reading document: {doc_name}")
            
            # Call the Docs API
            document = docs_service.documents().get(documentId=doc_id).execute()
            
            # Extract some text content
            content = document.get('body').get('content')
            
            # Get document text
            text_content = []
            for element in content:
                if 'paragraph' in element:
                    paragraph = element.get('paragraph')
                    for elem in paragraph.get('elements', []):
                        if 'textRun' in elem:
                            text_content.append(elem.get('textRun').get('content', ''))
            
            # Display first 500 characters
            preview = ''.join(text_content)[:500]
            print("\nDocument Preview:")
            print(preview + ('...' if len(''.join(text_content)) > 500 else ''))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
