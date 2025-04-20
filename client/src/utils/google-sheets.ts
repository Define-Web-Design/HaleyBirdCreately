
import axios from 'axios';

/**
 * Google Sheets API Client
 * 
 * This utility provides methods for interacting with Google Sheets API.
 * Requires proper authentication with API key or OAuth token.
 */

interface SheetData {
  range: string;
  values: any[][];
}

export class GoogleSheetsClient {
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  private token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  /**
   * Get sheet data from a Google Spreadsheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation of the range to retrieve
   */
  async getSheetData(spreadsheetId: string, range: string): Promise<SheetData> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${spreadsheetId}/values/${range}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'FORMATTED_STRING',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  }
  
  /**
   * Update sheet data in a Google Spreadsheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation of the range to update
   * @param values The values to update
   */
  async updateSheetData(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/${spreadsheetId}/values/${range}`,
        {
          range,
          values,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          params: {
            valueInputOption: 'USER_ENTERED',
          },
        }
      );
    } catch (error) {
      console.error('Error updating Google Sheets data:', error);
      throw error;
    }
  }
  
  /**
   * Append data to a Google Spreadsheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation of the range to append to
   * @param values The values to append
   */
  async appendSheetData(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${spreadsheetId}/values/${range}:append`,
        {
          range,
          values,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          params: {
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
          },
        }
      );
    } catch (error) {
      console.error('Error appending Google Sheets data:', error);
      throw error;
    }
  }
}

export default GoogleSheetsClient;
