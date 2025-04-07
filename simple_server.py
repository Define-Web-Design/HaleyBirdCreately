import http.server
import socketserver
import json
import os
import requests
from datetime import datetime
import urllib.parse
import cgi
import http.client
import base64

PORT = int(os.environ.get('PORT', 3000))

# Default colors to use when OpenAI API is not available
DEFAULT_COLORS = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"]

class SimpleHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)
        
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            request_data = json.loads(post_data)
        except json.JSONDecodeError:
            self._set_headers(400)
            response = {'error': 'Invalid JSON'}
            self.wfile.write(json.dumps(response).encode())
            return
            
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/api/palette/generate':
            self._handle_generate_palette(request_data)
        elif parsed_path.path == '/api/palette/analyze':
            self._handle_analyze_image(request_data)
        else:
            self._set_headers(404)
            response = {
                'error': 'Not Found',
                'message': f'The POST endpoint {self.path} is not supported',
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
    
    def _handle_generate_palette(self, data):
        # Extract parameters
        mood = data.get('mood', 'happy')
        description = data.get('description', '')
        count = data.get('count', 5)
        
        # Get OpenAI API key
        api_key = os.environ.get('OPENAI_API_KEY')
        
        if not api_key:
            self._set_headers(200)
            response = {
                'colors': DEFAULT_COLORS,
                'explanation': 'A default color palette (OpenAI API key not provided)',
                'generated': False
            }
            self.wfile.write(json.dumps(response).encode())
            return
            
        try:
            # Format the request for OpenAI
            moodDesc = f"{mood} mood and this description: '{description}'" if description else f"{mood} mood"
            prompt = f"Generate a cohesive color palette of {count} colors that represents a {moodDesc}. The colors should work well together and convey the right emotional tone."
            
            system_prompt = f"""You are a professional color theory expert and designer who creates perfect color palettes based on moods and emotions. 
            Return a JSON object with these keys: 
            "colors" (array of exactly {count} hex color codes like "#RRGGBB"), and 
            "explanation" (a brief description of the palette and how it relates to the requested mood).
            Ensure all colors work well together, have good contrast ratios when appropriate, and truly capture the essence of the requested mood."""
            
            # Call OpenAI API
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000,
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post(url, headers=headers, json=payload)
            response_data = response.json()
            
            # Process the OpenAI response
            if 'choices' in response_data and len(response_data['choices']) > 0:
                content = response_data['choices'][0]['message']['content']
                palette = json.loads(content)
                
                # Ensure we have the right number of colors
                if 'colors' in palette and len(palette['colors']) != count:
                    palette['colors'] = palette['colors'][:count]
                    
                    # If we still don't have enough, add some default colors
                    while len(palette['colors']) < count:
                        palette['colors'].append(DEFAULT_COLORS[len(palette['colors']) % len(DEFAULT_COLORS)])
                
                # Add generated flag
                palette['generated'] = True
                
                self._set_headers(200)
                self.wfile.write(json.dumps(palette).encode())
            else:
                # Return default if there's an issue with the OpenAI response
                self._set_headers(200)
                response = {
                    'colors': DEFAULT_COLORS,
                    'explanation': f"A default palette for '{mood}' mood (OpenAI API provided an invalid response)",
                    'generated': False
                }
                self.wfile.write(json.dumps(response).encode())
                
        except Exception as e:
            print(f"Error generating palette: {str(e)}")
            self._set_headers(500)
            response = {
                'error': f"Failed to generate color palette: {str(e)}",
                'colors': DEFAULT_COLORS,
                'explanation': f"A default palette (error occurred during generation)",
                'generated': False
            }
            self.wfile.write(json.dumps(response).encode())
    
    def _handle_analyze_image(self, data):
        # Extract parameters
        image_base64 = data.get('image', '')
        prompt = data.get('prompt', 'What colors are prominent in this image?')
        
        # Get OpenAI API key
        api_key = os.environ.get('OPENAI_API_KEY')
        
        if not api_key or not image_base64:
            self._set_headers(400)
            response = {
                'error': 'Missing API key or image data',
                'analysis': 'Unable to analyze image'
            }
            self.wfile.write(json.dumps(response).encode())
            return
            
        try:
            # Call OpenAI API with vision model
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 500
            }
            
            response = requests.post(url, headers=headers, json=payload)
            response_data = response.json()
            
            # Process the OpenAI response
            if 'choices' in response_data and len(response_data['choices']) > 0:
                analysis = response_data['choices'][0]['message']['content']
                
                self._set_headers(200)
                result = {
                    'analysis': analysis,
                    'success': True
                }
                self.wfile.write(json.dumps(result).encode())
            else:
                # Return error if there's an issue with the OpenAI response
                self._set_headers(200)
                response = {
                    'error': 'Failed to analyze image',
                    'analysis': 'OpenAI API provided an invalid response',
                    'success': False
                }
                self.wfile.write(json.dumps(response).encode())
                
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            self._set_headers(500)
            response = {
                'error': f"Failed to analyze image: {str(e)}",
                'analysis': 'An error occurred during analysis',
                'success': False
            }
            self.wfile.write(json.dumps(response).encode())
        
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)
        
        if parsed_path.path == '/' or parsed_path.path == '/api':
            # Serve a basic HTML front-end for testing
            self._set_headers(200, 'text/html')
            html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Creately - Color Palette Generator</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1 {
                        color: #2563EB;
                        margin-bottom: 10px;
                    }
                    h2 {
                        color: #4B5563;
                        margin-top: 30px;
                    }
                    .status {
                        background-color: #F3F4F6;
                        padding: 15px;
                        border-radius: 6px;
                        margin-bottom: 30px;
                    }
                    .palette-form {
                        background-color: #F9FAFB;
                        padding: 20px;
                        border-radius: 6px;
                        margin-bottom: 30px;
                    }
                    label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: 500;
                    }
                    input, select, textarea {
                        width: 100%;
                        padding: 8px;
                        margin-bottom: 15px;
                        border: 1px solid #D1D5DB;
                        border-radius: 4px;
                    }
                    button {
                        background-color: #2563EB;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #1D4ED8;
                    }
                    .palette-display {
                        display: flex;
                        margin-top: 20px;
                        height: 100px;
                    }
                    .color-box {
                        flex: 1;
                        margin-right: 2px;
                    }
                    .explanation {
                        margin-top: 15px;
                        padding: 10px;
                        background-color: #F3F4F6;
                        border-radius: 4px;
                    }
                    .color-code {
                        text-align: center;
                        margin-top: 5px;
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
                <h1>Creately - Color Palette Generator</h1>
                <p>An AI-powered creative platform that revolutionizes color palette generation through emotion-driven design solutions.</p>
                
                <div class="status">
                    <h3>API Status</h3>
                    <p>Database: <span id="db-status">Checking...</span></p>
                    <p>OpenAI API: <span id="openai-status">Checking...</span></p>
                </div>
                
                <div class="palette-form">
                    <h2>Generate Mood-Based Color Palette</h2>
                    <form id="palette-form">
                        <label for="mood">Mood:</label>
                        <select id="mood" name="mood" required>
                            <option value="happy">Happy</option>
                            <option value="calm">Calm</option>
                            <option value="energetic">Energetic</option>
                            <option value="professional">Professional</option>
                            <option value="romantic">Romantic</option>
                            <option value="mysterious">Mysterious</option>
                            <option value="playful">Playful</option>
                            <option value="elegant">Elegant</option>
                            <option value="bold">Bold</option>
                            <option value="serene">Serene</option>
                        </select>
                        
                        <label for="description">Additional Description (optional):</label>
                        <textarea id="description" name="description" rows="3" placeholder="Describe the feeling or context for more precise results..."></textarea>
                        
                        <button type="submit">Generate Palette</button>
                    </form>
                    
                    <div id="results" style="display: none;">
                        <h3>Your Palette</h3>
                        <div class="palette-display" id="palette-display"></div>
                        <div class="color-codes" id="color-codes"></div>
                        <div class="explanation" id="explanation"></div>
                    </div>
                </div>
                
                <script>
                    // Check API status on page load
                    fetch('/api')
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById('db-status').textContent = data.database;
                            document.getElementById('openai-status').textContent = data.apiKeys.openai;
                        })
                        .catch(error => {
                            document.getElementById('db-status').textContent = 'Error checking status';
                            document.getElementById('openai-status').textContent = 'Error checking status';
                        });
                    
                    // Handle form submission
                    document.getElementById('palette-form').addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const mood = document.getElementById('mood').value;
                        const description = document.getElementById('description').value;
                        
                        fetch('/api/palette/generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                mood: mood,
                                description: description,
                                count: 5
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            displayPalette(data);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Failed to generate palette. Please try again.');
                        });
                    });
                    
                    function displayPalette(data) {
                        const paletteDisplay = document.getElementById('palette-display');
                        const colorCodes = document.getElementById('color-codes');
                        const explanation = document.getElementById('explanation');
                        
                        // Clear previous results
                        paletteDisplay.innerHTML = '';
                        colorCodes.innerHTML = '';
                        
                        // Display colors
                        data.colors.forEach(color => {
                            const colorBox = document.createElement('div');
                            colorBox.className = 'color-box';
                            colorBox.style.backgroundColor = color;
                            paletteDisplay.appendChild(colorBox);
                            
                            const colorCode = document.createElement('div');
                            colorCode.className = 'color-code';
                            colorCode.textContent = color;
                            colorCodes.appendChild(colorCode);
                        });
                        
                        // Display explanation
                        explanation.textContent = data.explanation;
                        
                        // Show results section
                        document.getElementById('results').style.display = 'block';
                    }
                </script>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        elif parsed_path.path == '/api/info':
            self._set_headers()
            response = {
                'message': 'Creately API (Python Fallback Server)',
                'timestamp': datetime.now().isoformat(),
                'status': 'SUCCESS',
                'database': 'Available (PostgreSQL)' if os.environ.get('DATABASE_URL') else 'Not configured',
                'apiKeys': {
                    'openai': 'Available' if os.environ.get('OPENAI_API_KEY') else 'Missing',
                    'pagespeed': 'Available' if os.environ.get('PAGESPEED_INSIGHTS_API_KEY') else 'Missing'
                },
                'server': 'Python Simple HTTP Server (Fallback)'
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
        elif parsed_path.path == '/api/moods':
            self._set_headers()
            response = {
                'moods': [
                    'happy', 'calm', 'energetic', 'professional', 'romantic', 
                    'mysterious', 'playful', 'elegant', 'bold', 'serene',
                    'creative', 'modern', 'vintage', 'natural', 'futuristic',
                    'relaxed', 'vibrant', 'minimalist', 'luxurious', 'earthy'
                ]
            }
            self.wfile.write(json.dumps(response).encode())
        elif parsed_path.path.startswith('/api/pagespeed'):
            api_key = os.environ.get('PAGESPEED_INSIGHTS_API_KEY')
            self._set_headers(200 if api_key else 400)
            response = {
                'message': 'PageSpeed Insights API route',
                'timestamp': datetime.now().isoformat()
            }
            
            if not api_key:
                response['error'] = 'PageSpeed Insights API key is not configured'
            else:
                response['status'] = 'API key is configured'
                
            self.wfile.write(json.dumps(response, indent=2).encode())
        else:
            self._set_headers(404)
            response = {
                'error': 'Not Found',
                'message': f'The requested path {self.path} was not found',
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response, indent=2).encode())

# Read .env file and set environment variables
try:
    with open('.env', 'r') as env_file:
        for line in env_file:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key] = value
    print("Environment variables loaded from .env file")
except Exception as e:
    print(f"Error loading .env file: {e}")

def run_server():
    Handler = SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("0.0.0.0", PORT), Handler)
    print(f"Server running at http://0.0.0.0:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()