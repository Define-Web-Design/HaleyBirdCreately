
import os
import sys
import json
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Google Sheets service
from server.utils.google_sheets import GoogleSheetsService

def generate_random_hex_color():
    """Generate a random hex color code"""
    return f"#{random.randint(0, 0xFFFFFF):06x}"

def create_color_palette(num_colors=5):
    """Create a random color palette with the specified number of colors"""
    return [generate_random_hex_color() for _ in range(num_colors)]

def export_color_palettes_to_sheets(palettes, sheet_title="Color Palettes"):
    """Export color palettes to a Google Sheet"""
    # Initialize Google Sheets service
    sheets_service = GoogleSheetsService()
    
    # Create a new spreadsheet
    spreadsheet_id = sheets_service.create_spreadsheet(sheet_title)
    if not spreadsheet_id:
        print("Failed to create spreadsheet.")
        return None
        
    print(f"Created new spreadsheet with ID: {spreadsheet_id}")
    
    # Prepare data for the spreadsheet
    header = ["Palette ID", "Color 1", "Color 2", "Color 3", "Color 4", "Color 5", "Tags"]
    rows = [header]
    
    for idx, palette in enumerate(palettes):
        # Ensure all palettes have 5 colors by padding with empty strings if needed
        colors = palette["colors"] + [""] * (5 - len(palette["colors"]))
        row = [f"palette_{idx+1}"] + colors[:5] + [", ".join(palette.get("tags", []))]
        rows.append(row)
    
    # Write data to the spreadsheet
    result = sheets_service.write_range(spreadsheet_id, "Sheet1!A1", rows)
    if not result:
        print("Failed to write data to spreadsheet.")
        return None
    
    print(f"Successfully wrote {len(palettes)} palettes to the spreadsheet.")
    return spreadsheet_id

def import_color_palettes_from_sheets(spreadsheet_id, range_name="Sheet1!A2:G"):
    """Import color palettes from a Google Sheet"""
    # Initialize Google Sheets service
    sheets_service = GoogleSheetsService()
    
    # Read data from the spreadsheet
    data = sheets_service.read_range(spreadsheet_id, range_name)
    if not data:
        print("No data found in spreadsheet.")
        return []
    
    # Convert the data to palette objects
    palettes = []
    for row in data:
        # Ensure the row has enough columns
        row = row + [""] * (7 - len(row))
        
        palette_id = row[0]
        colors = [color for color in row[1:6] if color]  # Collect non-empty color values
        tags = [tag.strip() for tag in row[6].split(",")] if row[6] else []
        
        palettes.append({
            "id": palette_id,
            "colors": colors,
            "tags": tags
        })
    
    return palettes

def main():
    print("Color Palette Google Sheets Integration Example")
    print("----------------------------------------------")
    
    # Generate some sample color palettes
    sample_palettes = [
        {
            "colors": create_color_palette(5),
            "tags": ["vibrant", "summer", "bright"]
        },
        {
            "colors": create_color_palette(5),
            "tags": ["pastels", "soft", "spring"]
        },
        {
            "colors": create_color_palette(5),
            "tags": ["monochrome", "professional", "minimal"]
        },
        {
            "colors": create_color_palette(5),
            "tags": ["warm", "autumn", "earthy"]
        },
        {
            "colors": create_color_palette(5),
            "tags": ["cool", "winter", "tech"]
        }
    ]
    
    # Ask if user wants to export or import color palettes
    print("\nSelect an option:")
    print("1. Export color palettes to Google Sheets")
    print("2. Import color palettes from Google Sheets")
    
    choice = input("\nEnter your choice (1 or 2): ")
    
    if choice == "1":
        # Export palettes to a new Google Sheet
        spreadsheet_id = export_color_palettes_to_sheets(sample_palettes)
        if spreadsheet_id:
            print(f"\nYou can view your spreadsheet at: https://docs.google.com/spreadsheets/d/{spreadsheet_id}")
    
    elif choice == "2":
        # Import palettes from an existing Google Sheet
        spreadsheet_id = input("\nEnter the spreadsheet ID: ")
        palettes = import_color_palettes_from_sheets(spreadsheet_id)
        
        print(f"\nImported {len(palettes)} color palettes:")
        for idx, palette in enumerate(palettes):
            print(f"\nPalette {idx+1}:")
            print(f"ID: {palette['id']}")
            print(f"Colors: {', '.join(palette['colors'])}")
            print(f"Tags: {', '.join(palette['tags'])}")
    
    else:
        print("Invalid choice. Please run the script again and select a valid option.")

if __name__ == "__main__":
    main()
