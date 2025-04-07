import http.server
import json
import os
import base64
import urllib.request
import urllib.error
import ssl
import dotenv
import sys
import random

# Load environment variables
dotenv.load_dotenv()

# Default palette colors
DEFAULT_COLORS = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"]

PORT = int(os.environ.get('PORT', 3000))

class PaletteHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')  # Enable CORS
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_OPTIONS(self):
        self._set_headers(204)
        
    def _parse_post_data(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))
        
    def do_POST(self):
        if self.path == '/api/palette/generate':
            try:
                data = self._parse_post_data()
                response = self._handle_generate_palette(data)
                self._set_headers()
                self.wfile.write(json.dumps(response).encode())
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        elif self.path == '/api/palette/analyze':
            try:
                data = self._parse_post_data()
                response = self._handle_analyze_image(data)
                self._set_headers()
                self.wfile.write(json.dumps(response).encode())
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
            
    def _handle_generate_palette(self, data):
        mood = data.get('mood', 'happy')
        description = data.get('description', '')
        count = data.get('count', 5)
        
        # Get OpenAI API key
        api_key = os.environ.get('OPENAI_API_KEY')
        
        if not api_key:
            # Return default colors if no API key
            return {
                "colors": DEFAULT_COLORS,
                "explanation": f"A default palette for '{mood}' mood (OpenAI API key not provided)",
                "generated": False
            }
        
        try:
            # Format the request for OpenAI
            mood_description = f"{mood} mood" + (f" with this description: '{description}'" if description else "")
            prompt = f"Generate a cohesive color palette of {count} colors that represents a {mood_description}. The colors should work well together and convey the right emotional tone."
            
            system_prompt = f"""You are a professional color theory expert and designer who creates perfect color palettes based on moods and emotions. 
            Return a JSON object with these keys: 
            "colors" (array of exactly {count} hex color codes like "#RRGGBB"), and 
            "explanation" (a brief description of the palette and how it relates to the requested mood).
            Ensure all colors work well together, have good contrast ratios when appropriate, and truly capture the essence of the requested mood."""
            
            # Call OpenAI API
            response = self._call_openai_api(api_key, prompt, system_prompt)
            
            # Parse the OpenAI response
            content = response['choices'][0]['message']['content']
            palette = json.loads(content)
            
            # Ensure we have the right number of colors
            if len(palette.get('colors', [])) != count:
                palette['colors'] = palette.get('colors', [])[:count]
                
                # If we still don't have enough, add some default colors
                while len(palette['colors']) < count:
                    palette['colors'].append(DEFAULT_COLORS[len(palette['colors']) % len(DEFAULT_COLORS)])
            
            # Add generated flag
            palette['generated'] = True
            
            return palette
        except Exception as e:
            print(f"Error generating palette: {str(e)}")
            return {
                "colors": DEFAULT_COLORS,
                "explanation": f"A default palette for '{mood}' mood (error: {str(e)})",
                "generated": False
            }
    
    def _handle_analyze_image(self, data):
        image_base64 = data.get('image', '')
        prompt = data.get('prompt', 'What colors are prominent in this image?')
        
        # Get OpenAI API key
        api_key = os.environ.get('OPENAI_API_KEY')
        
        if not api_key or not image_base64:
            return {
                "error": "Missing API key or image data",
                "analysis": "Unable to analyze image",
                "success": False
            }
        
        try:
            # Prepare request for OpenAI vision API
            request_data = {
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
            
            # Call OpenAI API
            response = self._call_openai_api(api_key, None, None, vision_data=request_data)
            
            return {
                "analysis": response['choices'][0]['message']['content'],
                "success": True
            }
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            return {
                "error": f"Failed to analyze image: {str(e)}",
                "analysis": "An error occurred during analysis",
                "success": False
            }
    
    def _call_openai_api(self, api_key, prompt=None, system_prompt=None, vision_data=None):
        if vision_data:
            # Use pre-formatted data for vision API
            data = vision_data
        else:
            # Format data for text API
            data = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            # Add response format for JSON requests
            if prompt and system_prompt:
                data["response_format"] = {"type": "json_object"}
        
        # Convert data to JSON
        data_json = json.dumps(data).encode('utf-8')
        
        # Create request
        url = 'https://api.openai.com/v1/chat/completions'
        request = urllib.request.Request(url, data=data_json, headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        })
        
        # Handle SSL verification
        context = ssl.create_default_context()
        
        # Send request
        with urllib.request.urlopen(request, context=context) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
    
    def do_GET(self):
        if self.path == '/' or self.path == '/api':
            # Serve HTML interface
            self._set_headers(content_type='text/html')
            self.wfile.write(self._generate_html().encode())
        elif self.path == '/api/status':
            # Return API status
            self._set_headers()
            status = {
                "status": "online",
                "version": "1.0.0",
                "timestamp": self._get_timestamp(),
                "database": "connected" if os.environ.get('DATABASE_URL') else "not configured",
                "apiKeys": {
                    "openai": "configured" if os.environ.get('OPENAI_API_KEY') else "not configured"
                }
            }
            self.wfile.write(json.dumps(status).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def _get_timestamp(self):
        from datetime import datetime
        return datetime.now().isoformat()
    
    def _generate_html(self):
        return """
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
        fetch('/api/status')
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
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Generating...';
            submitButton.disabled = true;
            
            // Make API request
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
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                
                // Display results
                const paletteDisplay = document.getElementById('palette-display');
                const colorCodes = document.getElementById('color-codes');
                const explanation = document.getElementById('explanation');
                
                // Clear previous results
                paletteDisplay.innerHTML = '';
                colorCodes.innerHTML = '';
                
                // Display new palette
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
                
                // Set explanation
                explanation.textContent = data.explanation;
                
                // Show results
                document.getElementById('results').style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                alert('An error occurred while generating the palette. Please try again.');
            });
        });
    </script>
</body>
</html>
        """

def run_server():
    server_address = ('0.0.0.0', PORT)
    httpd = http.server.HTTPServer(server_address, PaletteHandler)
    print(f"Server running at http://0.0.0.0:{PORT}")
    print(f"OpenAI API Key: {'Configured' if os.environ.get('OPENAI_API_KEY') else 'Not configured (will use default colors)'}")
    print(f"Database: {'Connected' if os.environ.get('DATABASE_URL') else 'Not configured'}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()