
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import GoogleSheetsClient from '../../utils/google-sheets';

interface SheetData {
  range: string;
  values: any[][];
}

export default function GoogleSheetsExample() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Example spreadsheet ID and range
  const spreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // This is a public Google Sample Spreadsheet
  const range = 'Class Data!A1:E';
  
  // This would come from your auth context in a real application
  const demoToken = 'YOUR_ACCESS_TOKEN'; 
  
  const loadSheetData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = new GoogleSheetsClient(demoToken);
      const data = await client.getSheetData(spreadsheetId, range);
      setSheetData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load spreadsheet data');
      console.error('Error loading spreadsheet data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Google Sheets Integration</CardTitle>
        <CardDescription>
          Example of loading and displaying data from Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-muted-foreground">
              Spreadsheet ID: {spreadsheetId}
            </span>
          </div>
          <Button 
            onClick={loadSheetData} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load Spreadsheet Data'}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}
        
        {sheetData && (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                {sheetData.values.length > 0 && (
                  <TableRow>
                    {sheetData.values[0].map((header, i) => (
                      <TableHead key={i}>{header}</TableHead>
                    ))}
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {sheetData.values.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>To use Google Sheets in your app:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>Set up Google OAuth with the Sheets API scope</li>
            <li>Get an access token from the OAuth flow</li>
            <li>Use the GoogleSheetsClient to interact with your spreadsheets</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
