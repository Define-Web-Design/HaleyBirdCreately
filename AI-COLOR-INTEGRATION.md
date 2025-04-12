# AI-Powered Color Generation Integration

This document provides an overview of the AI-powered color generation features integrated into Creately.

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [API Reference](#api-reference)
4. [AI Service Integration](#ai-service-integration)
5. [Configuration](#configuration)
6. [Error Handling & Fallbacks](#error-handling--fallbacks)
7. [Testing](#testing)
8. [Examples](#examples)

## Overview

Creately's AI-powered color generation uses a combination of Mistral AI and OpenAI to generate color palettes, design schemes, and accessible color variations based on natural language descriptions. The system is designed with a robust fallback mechanism that ensures color generation functionality even when primary AI services are unavailable.

## Features

### Color Palette Generation
Generate harmonious color palettes based on mood descriptions or themes.

```javascript
// Example: Generate a "calm ocean breeze" palette
fetch('/api/colors/generate-palette', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    description: 'calm ocean breeze',
    colors: 5 
  })
})
```

### Design Scheme Generation
Generate comprehensive color schemes for specific design types (websites, mobile apps, presentations, etc.).

```javascript
// Example: Generate a color scheme for a mobile app
fetch('/api/colors/design-scheme', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ designType: 'mobile app' })
})
```

### Accessible Color Variations
Generate accessible color variations based on a base color and purpose.

```javascript
// Example: Generate accessible variations for a background color
fetch('/api/colors/accessible-colors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    baseColor: '#3498db',
    purpose: 'background' 
  })
})
```

## API Reference

### Endpoints

#### GET `/api/colors/status`
Check the status of color generation services.

**Response:**
```json
{
  "status": "success",
  "services": {
    "mistral": "available",
    "openai": "available",
    "colorGeneratorLoaded": true,
    "aiServices": {
      "mistral": true,
      "openai": true,
      "usingFallbacks": false
    }
  },
  "timestamp": "2023-04-12T12:34:56.789Z"
}
```

#### POST `/api/colors/generate-palette`
Generate a color palette based on a description.

**Request Body:**
```json
{
  "description": "sunset over the ocean",
  "colors": 5
}
```

**Response:**
```json
{
  "status": "success",
  "service_used": "mistral",
  "theme": "sunset over the ocean",
  "description": "A warm and soothing palette inspired by coastal twilight...",
  "colors": [
    {
      "hex": "#FF7E5F",
      "name": "Sunset Orange",
      "role": "primary"
    },
    {
      "hex": "#FEB47B",
      "name": "Golden Glow",
      "role": "secondary"
    },
    // More colors...
  ],
  "timestamp": "2023-04-12T12:34:56.789Z"
}
```

#### POST `/api/colors/design-scheme`
Generate a color scheme for a specific design type.

**Request Body:**
```json
{
  "designType": "website"
}
```

**Response:**
```json
{
  "status": "success",
  "service_used": "openai",
  "designType": "website",
  "description": "A balanced website color scheme with good contrast and readability...",
  "scheme": {
    "primary": "#3498db",
    "secondary": "#2ecc71",
    "accent": "#9b59b6",
    "background": "#f5f5f5",
    "text": "#333333",
    "success": "#27ae60",
    "warning": "#f39c12",
    "error": "#e74c3c"
  },
  "recommendations": [
    "Maintain good contrast between text and background colors",
    "Use the primary color for main interface elements",
    "Reserve accent colors for calls to action"
  ],
  "timestamp": "2023-04-12T12:34:56.789Z"
}
```

#### POST `/api/colors/accessible-colors`
Generate accessible color variations for a base color.

**Request Body:**
```json
{
  "baseColor": "#3498db",
  "purpose": "background"
}
```

**Response:**
```json
{
  "status": "success",
  "service_used": "mistral",
  "baseColor": "#3498db",
  "purpose": "background",
  "variations": {
    "normal": "#3498db",
    "highContrast": "#1a75b7",
    "lowLight": "#a8d1ef",
    "colorBlindFriendly": "#4682b4"
  },
  "complementaryColors": {
    "text": "#ffffff",
    "border": "#2980b9"
  },
  "wcagRating": "AA",
  "tips": [
    "Ensure a contrast ratio of at least 4.5:1 for normal text",
    "Use larger text for better readability with this color",
    "Test your design with color blindness simulators"
  ],
  "timestamp": "2023-04-12T12:34:56.789Z"
}
```

#### GET `/api/colors/default-palettes`
Get default color palettes for common moods.

**Response:**
```json
{
  "status": "success",
  "message": "Default palettes for common moods",
  "palettes": {
    "happy": {
      "colors": [...],
      "description": "A cheerful palette with bright yellows, turquoise, and vibrant accents"
    },
    // More palettes...
  }
}
```

#### GET `/api/colors/default-schemes`
Get default design schemes.

**Response:**
```json
{
  "status": "success",
  "message": "Default design schemes",
  "schemes": {
    "website": {
      "scheme": {...},
      "description": "A balanced website color scheme with good contrast and readability"
    },
    // More schemes...
  }
}
```

## AI Service Integration

Creately uses a multi-tier approach to AI service integration:

### Primary: Mistral AI
The primary AI service is Mistral AI, chosen for its efficiency and performance in generating creative content. The service is integrated through the `server/services/color-generator.js` module.

### Secondary/Fallback: OpenAI
OpenAI serves as the fallback when Mistral AI is unavailable or fails. This integration is handled in the `server/services/openai.js` module.

### Enhanced Integration
The `server/services/ai-color-generator.js` module provides a unified interface that automatically handles fallbacks between services and implements algorithmic solutions when both AI services are unavailable.

## Configuration

### API Keys
AI service API keys should be configured in your environment or .env file:

```
# Mistral AI API key (primary)
MISTRAL_API_KEY=your_mistral_api_key_here

# OpenAI API key (fallback)
OPENAI_API_KEY=your_openai_api_key_here
```

### Environment Configuration
The `config/environment.js` file centralizes all configuration and provides feature flags based on available services.

## Error Handling & Fallbacks

The color generation system includes a robust error handling and fallback mechanism:

1. **Service Availability Check**: The system first checks if Mistral AI is available.
2. **Primary Service Attempt**: If available, it attempts to use Mistral AI for color generation.
3. **Fallback to Secondary**: If Mistral AI fails or is unavailable, it falls back to OpenAI.
4. **Algorithmic Fallback**: If both AI services fail, it uses built-in algorithms and default palettes.

All errors are properly logged with descriptive messages to aid in debugging.

## Testing

### Test Scripts
- `test-mistral-api.py`: Tests Mistral AI integration for color generation
- `test-openai.js`: Tests OpenAI integration for various features
- `test-color-generator.js`: Tests the combined color generation service

### Running Tests
1. Ensure API keys are configured in your environment
2. Run the test scripts:
   ```
   python test-mistral-api.py
   node test-openai.js
   node test-color-generator.js
   ```

## Examples

### Frontend Integration Example

```javascript
// Component for generating color palettes
function ColorPaletteGenerator() {
  const [description, setDescription] = useState('');
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePalette = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/colors/generate-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPalette(data);
      } else {
        setError(data.message || 'Failed to generate palette');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="palette-generator">
      <h2>Color Palette Generator</h2>
      
      <div className="input-group">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe a mood or theme (e.g., 'sunset over the ocean')"
        />
        <button onClick={generatePalette} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Palette'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {palette && (
        <div className="palette-result">
          <h3>{palette.theme}</h3>
          <p>{palette.description}</p>
          
          <div className="color-swatches">
            {palette.colors.map((color, index) => (
              <div key={index} className="color-swatch">
                <div 
                  className="swatch" 
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
                <div className="color-info">
                  <div className="color-name">{color.name}</div>
                  <div className="color-hex">{color.hex}</div>
                  <div className="color-role">{color.role}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="service-info">
            Generated using: {palette.service_used || 'AI service'}
          </div>
        </div>
      )}
    </div>
  );
}
```