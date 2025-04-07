import http.server
import socketserver
import json
import os
from datetime import datetime
import urllib.parse

PORT = int(os.environ.get('PORT', 3000))

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
        
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/' or parsed_path.path == '/api':
            self._set_headers()
            response = {
                'message': 'Hello from Creately API!',
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
        elif parsed_path.path.startswith('/pagespeed'):
            self._set_headers(200 if os.environ.get('PAGESPEED_INSIGHTS_API_KEY') else 400)
            response = {
                'message': 'PageSpeed Insights API route',
                'timestamp': datetime.now().isoformat()
            }
            
            if not os.environ.get('PAGESPEED_INSIGHTS_API_KEY'):
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