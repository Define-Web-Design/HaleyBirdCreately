
import { google, docs_v1 } from 'googleapis';

// You'll need to set up OAuth credentials for Docs API
// Similar to how you're handling Gemini API in your project
const API_KEY = process.env.VITE_GOOGLE_API_KEY || '';

/**
 * Create a Google Docs client
 * Requires authentication through OAuth 2.0
 */
export const createDocsClient = async (accessToken: string): Promise<docs_v1.Docs> => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.docs({ version: 'v1', auth });
};

/**
 * Get a document by ID
 */
export const getDocument = async (accessToken: string, documentId: string) => {
  const docsClient = await createDocsClient(accessToken);
  try {
    const response = await docsClient.documents.get({ documentId });
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

/**
 * Create a new document
 */
export const createDocument = async (accessToken: string, title: string) => {
  const docsClient = await createDocsClient(accessToken);
  try {
    const response = await docsClient.documents.create({
      requestBody: {
        title,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

/**
 * Insert text into a document
 */
export const insertText = async (
  accessToken: string, 
  documentId: string, 
  text: string, 
  index: number = 1
) => {
  const docsClient = await createDocsClient(accessToken);
  try {
    const response = await docsClient.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index,
              },
              text,
            },
          },
        ],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error inserting text:', error);
    throw error;
  }
};

/**
 * Export document content as plain text
 */
export const getDocumentContent = async (accessToken: string, documentId: string) => {
  const document = await getDocument(accessToken, documentId);
  let content = '';
  
  // Extract text from document content
  document.body?.content?.forEach((item) => {
    if (item.paragraph) {
      item.paragraph.elements?.forEach((element) => {
        content += element.textRun?.content || '';
      });
    }
  });
  
  return content;
};
