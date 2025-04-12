# Creately - AI-Powered Color Generator

Creately is an advanced AI-powered collaborative platform that enhances team productivity through intelligent technologies and engaging user interactions. It features intelligent color palette generation using both Mistral AI and OpenAI with robust fallback mechanisms.

## Core Features

- **AI-Powered Color Generation**: Generate color palettes based on mood descriptions, design schemes, and accessibility requirements.
- **Multi-Provider AI Integration**: Uses Mistral AI as the primary engine with OpenAI as a fallback option.
- **Graceful Degradation**: Provides default algorithmic palettes when AI services are unavailable.
- **PostgreSQL Database**: Stores user preferences, color palettes, and usage history.
- **Modern Frontend**: React.js with TypeScript and Tailwind CSS responsive design.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Mistral AI API key (optional but recommended)
- OpenAI API key (optional, used as fallback)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DATABASE_URL=your_postgresql_database_url
MISTRAL_API_KEY=your_mistral_api_key
OPENAI_API_KEY=your_openai_api_key
CODESTRAL_API_KEY=your_codestral_api_key
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/creately.git
   cd creately
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

4. Start the application:
   ```
   npm run dev
   ```

### Alternative Startup Methods

The application includes multiple startup options for different environments:

1. **Enhanced JavaScript Starter**:
   ```
   node start-app.js
   ```

2. **Basic Shell Starter**:
   ```
   ./start.sh
   ```

3. **Direct Server Start**:
   ```
   node server.js
   ```

## AI Color Generator

The color generator uses a tiered approach to provide palettes:

1. **Mistral AI** (Primary): Used if a Mistral API key is provided, offering high-quality palettes with contextual understanding.
2. **OpenAI** (Fallback): Used if Mistral is unavailable but an OpenAI API key is provided.
3. **Default Algorithmic Palettes** (Last Resort): Used if no AI services are available, providing predefined palettes for common moods.

### Color Generation Endpoints

#### 1. Generate Color Palette
Generate a cohesive color palette based on a mood description.

```
POST /api/colors/generate-palette
```

Request body:
```json
{
  "description": "calm and professional",
  "colors": 5
}
```

Response:
```json
{
  "status": "success",
  "service_used": "mistral",
  "theme": "calm and professional",
  "description": "A balanced palette combining calming blues with professional grays",
  "colors": [
    {
      "hex": "#2C3E50",
      "name": "Color 1",
      "role": "primary"
    },
    {
      "hex": "#34495E",
      "name": "Color 2",
      "role": "secondary"
    },
    ...
  ]
}
```

#### 2. Generate Design Scheme
Generate a complete design scheme with primary, secondary, accent, and background colors.

```
POST /api/colors/generate-design-scheme
```

Request body:
```json
{
  "description": "modern tech startup",
  "style": "minimal"
}
```

#### 3. Generate Accessible Colors
Generate color combinations that meet WCAG accessibility standards.

```
POST /api/colors/generate-accessible-colors
```

Request body:
```json
{
  "baseColor": "#3498DB",
  "contrastRatio": 4.5
}
```

## Database Schema

The PostgreSQL database stores:

- User preferences and settings
- Generated color palettes and their metadata
- Usage history and analytics

## Troubleshooting

### Common Issues

1. **API Key Issues**: If color generation fails, check that your Mistral and/or OpenAI API keys are correctly set in the `.env` file.

2. **Node.js Not Found**: Ensure Node.js is installed and in your PATH. The application will attempt to use multiple methods to start in different environments.

3. **Database Connection**: Verify your PostgreSQL connection string in the `.env` file is correct.

## Architecture

The application follows a modern, modular architecture:

```
├── client/            (Frontend code)
├── server/            (Backend code)
├── shared/            (Shared code)
├── public/            (Static assets)
├── config/            (Configuration files)
├── .env               (Environment variables)
├── package.json       (Package configuration)
├── server.js          (Main server)
├── start-app.js       (Application starter)
├── start.sh           (Shell starter)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.