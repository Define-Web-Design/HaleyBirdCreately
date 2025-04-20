
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
SCOPES = ['https://www.googleapis.com/auth/documents.readonly']

def main():
    print("Google Docs Python Example")
    print("--------------------------")
    
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
    
    # Build the Docs API service
    service = build('docs', 'v1', credentials=creds)
    
    # Example 1: Reading a document
    print("\n--- Example 1: Reading a Document ---")
    document_id = input("Enter a Google Document ID: ")
    
    if document_id:
        try:
            # Call the Docs API to get document content
            document = service.documents().get(documentId=document_id).execute()
            
            print(f"\nDocument Title: {document.get('title')}")
            print(f"Document URL: https://docs.google.com/document/d/{document_id}")
            
            # Get content elements
            content = document.get('body').get('content')
            
            # Print first few paragraphs of text
            print("\nDocument Preview:")
            text_content = []
            for element in content:
                if 'paragraph' in element:
                    paragraph = element.get('paragraph')
                    for elem in paragraph.get('elements', []):
                        if 'textRun' in elem:
                            text_content.append(elem.get('textRun').get('content', ''))
            
            # Display first 500 characters
            preview = ''.join(text_content)[:500]
            print(preview + ('...' if len(''.join(text_content)) > 500 else ''))
            
        except Exception as e:
            print(f"Error: {e}")
            print("Make sure the document exists and you have permission to access it.")
    else:
        print("No document ID provided.")
    
    # Example 2: List user's documents
    # This would require additional Drive API scope
    print("\nTo list your documents, you would need to also authorize with the Google Drive API.")
    print("Add the scope: https://www.googleapis.com/auth/drive.metadata.readonly")

if __name__ == "__main__":
    main()
