#!/usr/bin/env python3
"""
Creately - Color Palette Generator
Simple HTTP server implementation for the Creately application.
This server provides endpoints for color palette generation and image analysis.
"""

import http.server
import socketserver
import json
import os
import urllib.request
import urllib.error
import base64
import ssl
import re
import random
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# Environment variables
PORT = int(os.environ.get('PORT', 3000))
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Default color palettes for common moods when OpenAI API is not available
DEFAULT_PALETTES = {
    'happy': ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'],
    'calm': ['#A8DADC', '#E0FBFC', '#457B9D', '#1D3557', '#F1FAEE'],
    'energetic': ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'],
    'professional': ['#0A192F', '#112240', '#233554', '#8892B0', '#CCD6F6'],
    'romantic': ['#FF8CC6', '#F7B2BD', '#FFDBE5', '#D291BC', '#957DAD'],
    'mysterious': ['#2D3142', '#4F5D75', '#BFC0C0', '#FFFFFF', '#EF8354'],
    'playful': ['#FF9F1C', '#FFBF69', '#CBF3F0', '#2EC4B6', '#FDFFFC'],
    'elegant': ['#331832', '#694E52', '#886F68', '#9A8F97', '#DCE3F4'],
    'bold': ['#D7263D', '#F46036', '#2E294E', '#1B998B', '#C5D86D'],
    'serene': ['#5F7481', '#A2B6B4', '#DBD3C9', '#FAF9F9', '#E1BB80']
}

class PaletteHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        """Set response headers with CORS support"""
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self._set_headers(204)

    def _parse_post_data(self):
        """Parse JSON data from POST request"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            return json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            return {}

    def do_POST(self):
        """Handle POST requests for color palette generation and image analysis"""
        path = self.path

        # Generate palette endpoint
        if path == '/api/generate-palette':
            data = self._parse_post_data()
            result = self._handle_generate_palette(data)
            self._set_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            return

        # Analyze image endpoint
        if path == '/api/analyze-image':
            data = self._parse_post_data()
            result = self._handle_analyze_image(data)
            self._set_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            return

        # Not found
        self._set_headers(404)
        self.wfile.write(json.dumps({'status': 'error', 'message': 'Not found'}).encode('utf-8'))

    def _handle_generate_palette(self, data):
        """Handle color palette generation based on mood"""
        mood = data.get('mood', 'happy')
        description = data.get('description', '')

        print(f"Generating palette for mood: {mood}, description: {description}")

        # If OpenAI API key is not available, return default palette
        if not OPENAI_API_KEY:
            default_palette = DEFAULT_PALETTES.get(mood, DEFAULT_PALETTES['happy'])
            return {
                'status': 'success',
                'message': 'Generated using default palette (OpenAI API not configured)',
                'palette': default_palette,
                'explanation': f'A pre-defined palette for the mood "{mood}". To get AI-generated palettes, add your OpenAI API key.'
            }

        # Use OpenAI to generate a palette
        prompt = f"Generate a color palette of 5 hex codes for the mood: {mood}. {f'Additional description: {description}' if description else ''}"
        system_prompt = "You are a professional color designer. Generate a harmonious color palette of exactly 5 colors as hex codes for the given mood. Respond with a JSON object containing two properties: 'palette' as an array of 5 hex color codes, and 'explanation' as a short description of the palette."

        try:
            openai_response = self._call_openai_api(OPENAI_API_KEY, prompt=prompt, system_prompt=system_prompt)
            return {
                'status': 'success',
                **openai_response
            }
        except Exception as e:
            print(f"Error calling OpenAI: {str(e)}")
            # Fallback to default palette if OpenAI API fails
            default_palette = DEFAULT_PALETTES.get(mood, DEFAULT_PALETTES['happy'])
            return {
                'status': 'error',
                'message': f'Error calling OpenAI API: {str(e)}',
                'palette': default_palette,
                'explanation': f'Fallback palette for "{mood}" mood due to API error.'
            }

    def _handle_analyze_image(self, data):
        """Handle color palette extraction from an image URL"""
        image_url = data.get('imageUrl')
        
        if not image_url:
            return {
                'status': 'error',
                'message': 'Image URL is required'
            }

        print(f"Analyzing image: {image_url}")

        # If OpenAI API key is not available, return error
        if not OPENAI_API_KEY:
            return {
                'status': 'error',
                'message': 'OpenAI API key is required for image analysis',
                'error': 'API key not configured'
            }

        # Use OpenAI Vision API to analyze the image
        prompt = "Extract a color palette from this image. Identify the 5 most prominent or harmonious colors and provide their hex codes."
        system_prompt = "You are a color palette extraction expert. Analyze the image and extract exactly 5 colors that form a harmonious palette. Return a JSON with 'palette' (array of 5 hex codes) and 'explanation' (brief description of the palette)."
        
        try:
            openai_response = self._call_openai_api(OPENAI_API_KEY, prompt=prompt, system_prompt=system_prompt, vision_data=image_url)
            return {
                'status': 'success',
                **openai_response
            }
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            # Create a random palette as fallback
            random_palette = [f"#{random.randint(0, 0xFFFFFF):06x}" for _ in range(5)]
            return {
                'status': 'error',
                'message': f'Error analyzing image: {str(e)}',
                'palette': random_palette,
                'explanation': 'Randomly generated palette due to image analysis error.'
            }

    def _call_openai_api(self, api_key, prompt=None, system_prompt=None, vision_data=None):
        """Call OpenAI API for text or vision-based requests"""
        # Create message array based on whether we're using vision or not
        messages = [
            {"role": "system", "content": system_prompt or "You are a helpful assistant."},
        ]
        
        if vision_data:
            # For image analysis, add image URL to the content
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": vision_data}}
                ]
            })
            model = "gpt-4-vision-preview"
        else:
            # For text-based generation
            messages.append({"role": "user", "content": prompt})
            model = "gpt-3.5-turbo"
        
        # Prepare the request data
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": 500,
            "temperature": 0.7,
        }
        
        # Convert data to JSON string
        data_str = json.dumps(data)
        
        # Set up request
        req = urllib.request.Request(
            url="https://api.openai.com/v1/chat/completions",
            data=data_str.encode('utf-8'),
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
        )
        
        # Create a context that doesn't validate SSL (for environments with older certificates)
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        try:
            # Make the request
            with urllib.request.urlopen(req, context=ctx) as response:
                response_data = response.read().decode('utf-8')
                parsed_response = json.loads(response_data)
                
                # Extract the content from the response
                if "choices" in parsed_response and len(parsed_response["choices"]) > 0:
                    content = parsed_response["choices"][0]["message"]["content"]
                    
                    try:
                        # Try to parse the content as JSON
                        result = json.loads(content)
                        return result
                    except json.JSONDecodeError:
                        # If we can't parse JSON, try to extract palette from the text
                        print("Failed to parse JSON response, attempting to extract palette from text")
                        print(f"Content received: {content}")
                        
                        # Fallback extraction using regex to find hex codes
                        hex_codes = re.findall(r'#[0-9A-Fa-f]{6}', content)
                        palette = hex_codes[:5]  # Take up to 5 hex codes
                        
                        # If we don't have enough colors, add some from default palette
                        while len(palette) < 5:
                            palette.append(DEFAULT_PALETTES["professional"][len(palette)])
                        
                        return {
                            "palette": palette,
                            "explanation": "Palette extracted from OpenAI response (non-JSON format)."
                        }
                else:
                    raise Exception("No response choices returned from OpenAI")
                    
        except urllib.error.HTTPError as e:
            error_data = json.loads(e.read().decode('utf-8'))
            error_message = error_data.get('error', {}).get('message', str(e))
            raise Exception(f"OpenAI API error: {error_message}")
        except Exception as e:
            raise Exception(f"Error calling OpenAI API: {str(e)}")

    def do_GET(self):
        """Handle GET requests for static files and API status"""
        path = self.path
        parsed_url = urlparse(path)
        path = parsed_url.path
        
        # API status endpoint
        if path == '/api/status':
            status = {
                "server": "online",
                "openai_api": "connected" if OPENAI_API_KEY else "not_connected",
                "timestamp": self._get_timestamp(),
                "version": "1.0.0"
            }
            self._set_headers()
            self.wfile.write(json.dumps(status).encode('utf-8'))
            return
            
        # Serve the static HTML file
        if path == '/' or path == '':
            with open('static_version.html', 'rb') as file:
                self._set_headers(content_type='text/html')
                self.wfile.write(file.read())
            return
            
        # Try to serve static files
        try:
            # Remove leading slash and get file extension
            file_path = path[1:] if path.startswith('/') else path
            _, ext = os.path.splitext(file_path)
            
            # Map file extensions to MIME types
            mime_types = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml'
            }
            content_type = mime_types.get(ext.lower(), 'application/octet-stream')
            
            with open(file_path, 'rb') as file:
                self._set_headers(content_type=content_type)
                self.wfile.write(file.read())
        except FileNotFoundError:
            self._set_headers(404, 'text/html')
            self.wfile.write(b'404 - File Not Found')
        except Exception as e:
            self._set_headers(500, 'text/html')
            self.wfile.write(f'Server Error: {str(e)}'.encode('utf-8'))

    def _get_timestamp(self):
        """Get a formatted timestamp for logging"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _generate_html(self):
        """Generate HTML for static page (fallback)"""
        return """<!DOCTYPE html>
<html>
<head>
  <title>Creately - Color Palette Generator</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563EB; }
    .card { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .color-box { height: 50px; margin-bottom: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Creately - Color Palette Generator</h1>
  <div class="card">
    <h2>API Status</h2>
    <p>Server status: Online</p>
    <p>OpenAI API: {api_status}</p>
  </div>
  <div class="card">
    <h2>Sample Palette - Happy</h2>
    <div class="color-box" style="background-color: #FFD166;"></div>
    <div class="color-box" style="background-color: #06D6A0;"></div>
    <div class="color-box" style="background-color: #118AB2;"></div>
    <div class="color-box" style="background-color: #EF476F;"></div>
    <div class="color-box" style="background-color: #073B4C;"></div>
  </div>
</body>
</html>
""".format(api_status="Connected" if OPENAI_API_KEY else "Not configured")


def run_server():
    """Start the HTTP server"""
    server_address = ('0.0.0.0', PORT)
    httpd = socketserver.ThreadingTCPServer(server_address, PaletteHandler)
    print(f"Server starting on http://0.0.0.0:{PORT}")
    print(f"OpenAI API: {'Configured' if OPENAI_API_KEY else 'Not configured'}")
    print(f"Server start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server shutting down...")
    finally:
        httpd.server_close()
        print("Server stopped")


if __name__ == "__main__":
    run_server()