"""
Creately Keep-Alive Service
A simple Flask-based service that pings your application to keep it alive
"""

import os
import time
import threading
import logging
import datetime
import requests
import json
from flask import Flask, render_template_string, jsonify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/keep_alive.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("keep-alive")

# Make sure logs directory exists
os.makedirs("logs", exist_ok=True)

# Configuration
APP_PORT = 5173  # Default Vite server port
CHECK_INTERVAL = 55  # Seconds between checks
DASHBOARD_PORT = 8080  # Port for the status dashboard

# Try to determine the application URL
def get_app_url():
    """Determine the application URL based on environment"""
    hostname = os.environ.get('REPL_SLUG', 'localhost')
    if os.environ.get('REPL_SLUG') and os.environ.get('REPL_OWNER'):
        # We're in a Replit environment
        return f"https://{hostname}.{os.environ.get('REPL_OWNER')}.repl.co"
    else:
        # Local development
        return f"http://localhost:{APP_PORT}"

APP_URL = get_app_url()

# Initialize statistics
stats = {
    "start_time": time.time(),
    "ping_count": 0,
    "success_count": 0,
    "fail_count": 0,
    "last_ping_time": None,
    "last_ping_success": False,
    "last_status_code": None,
    "last_error": None
}

# Create Flask app
app = Flask(__name__)

# HTML template for the dashboard
DASHBOARD_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Creately Keep-Alive Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .card {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .stat {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 0;
        }
        .stat:last-child {
            border-bottom: none;
        }
        .success { color: #16a34a; }
        .warning { color: #ca8a04; }
        .error { color: #dc2626; }
        .refresh-btn {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .refresh-btn:hover {
            background-color: #1d4ed8;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-online { background-color: #16a34a; }
        .status-offline { background-color: #dc2626; }
    </style>
</head>
<body>
    <h1>Creately Keep-Alive Dashboard</h1>
    
    <div class="card">
        <h2>System Status</h2>
        <div class="stat">
            <span>Keep-Alive Status:</span>
            <span>
                <span class="status-indicator status-online"></span>
                <strong class="success">Running</strong>
            </span>
        </div>
        <div class="stat">
            <span>Application Status:</span>
            <span>
                <span class="status-indicator {{ 'status-online' if stats.last_ping_success else 'status-offline' }}"></span>
                <strong class="{{ 'success' if stats.last_ping_success else 'error' }}">
                    {{ 'Online' if stats.last_ping_success else 'Offline' }}
                </strong>
            </span>
        </div>
        <div class="stat">
            <span>Application URL:</span>
            <a href="{{ app_url }}" target="_blank">{{ app_url }}</a>
        </div>
        <div class="stat">
            <span>Uptime:</span>
            <strong>{{ uptime }}</strong>
        </div>
        <div class="stat">
            <span>Started At:</span>
            <span>{{ start_time }}</span>
        </div>
    </div>
    
    <div class="card">
        <h2>Ping Statistics</h2>
        <div class="stat">
            <span>Total Pings:</span>
            <strong>{{ stats.ping_count }}</strong>
        </div>
        <div class="stat">
            <span>Successful:</span>
            <strong class="success">{{ stats.success_count }}</strong>
        </div>
        <div class="stat">
            <span>Failed:</span>
            <strong class="{{ 'error' if stats.fail_count > 0 else '' }}">{{ stats.fail_count }}</strong>
        </div>
        <div class="stat">
            <span>Success Rate:</span>
            <strong>{{ success_rate }}%</strong>
        </div>
        <div class="stat">
            <span>Last Ping:</span>
            <span>{{ last_ping_time }}</span>
        </div>
        <div class="stat">
            <span>Last Status:</span>
            <strong class="{{ 'success' if stats.last_ping_success else 'error' }}">
                {{ stats.last_status_code if stats.last_status_code else 'N/A' }}
            </strong>
        </div>
        {% if stats.last_error %}
        <div class="stat">
            <span>Last Error:</span>
            <span class="error">{{ stats.last_error }}</span>
        </div>
        {% endif %}
    </div>
    
    <button class="refresh-btn" onclick="location.reload()">Refresh Dashboard</button>
    
    <script>
        // Auto refresh the page every 60 seconds
        setTimeout(() => {
            location.reload();
        }, 60000);
    </script>
</body>
</html>
"""

def format_uptime(seconds):
    """Format uptime in a human-readable format"""
    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    if days > 0:
        return f"{int(days)}d {int(hours)}h {int(minutes)}m {int(seconds)}s"
    elif hours > 0:
        return f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
    elif minutes > 0:
        return f"{int(minutes)}m {int(seconds)}s"
    else:
        return f"{int(seconds)}s"

@app.route('/')
def dashboard():
    """Render the dashboard"""
    uptime = format_uptime(time.time() - stats["start_time"])
    start_time = datetime.datetime.fromtimestamp(stats["start_time"]).strftime('%Y-%m-%d %H:%M:%S')
    
    success_rate = 0
    if stats["ping_count"] > 0:
        success_rate = round((stats["success_count"] / stats["ping_count"]) * 100, 2)
    
    last_ping_time = "Not yet pinged"
    if stats["last_ping_time"]:
        last_ping_time = datetime.datetime.fromtimestamp(stats["last_ping_time"]).strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template_string(
        DASHBOARD_TEMPLATE,
        stats=stats,
        app_url=APP_URL,
        uptime=uptime,
        start_time=start_time,
        success_rate=success_rate,
        last_ping_time=last_ping_time
    )

@app.route('/api/stats')
def api_stats():
    """Return stats as JSON"""
    return jsonify(stats)

def ping_application():
    """Ping the application to keep it alive"""
    global stats
    
    while True:
        stats["ping_count"] += 1
        stats["last_ping_time"] = time.time()
        
        try:
            logger.info(f"Pinging application at {APP_URL}...")
            response = requests.get(APP_URL, timeout=10)
            stats["last_status_code"] = response.status_code
            
            if response.status_code < 400:  # Success or redirect
                logger.info(f"✅ Ping successful (Status: {response.status_code})")
                stats["success_count"] += 1
                stats["last_ping_success"] = True
                stats["last_error"] = None
            else:
                logger.warning(f"❌ Ping failed (Status: {response.status_code})")
                stats["fail_count"] += 1
                stats["last_ping_success"] = False
                stats["last_error"] = f"HTTP {response.status_code}"
                
        except Exception as e:
            logger.error(f"❌ Ping failed: {str(e)}")
            stats["fail_count"] += 1
            stats["last_ping_success"] = False
            stats["last_status_code"] = None
            stats["last_error"] = str(e)
        
        # Calculate and log statistics
        success_rate = 0
        if stats["ping_count"] > 0:
            success_rate = round((stats["success_count"] / stats["ping_count"]) * 100, 2)
            
        logger.info(f"Stats: {stats['ping_count']} pings, {stats['success_count']} successful, {stats['fail_count']} failed ({success_rate}% success rate)")
        
        # Wait before the next ping
        time.sleep(CHECK_INTERVAL)

if __name__ == '__main__':
    # Start the ping thread
    logger.info("=== Creately Keep-Alive System Starting ===")
    logger.info(f"Application URL: {APP_URL}")
    logger.info(f"Check interval: {CHECK_INTERVAL} seconds")
    logger.info(f"Dashboard port: {DASHBOARD_PORT}")
    
    ping_thread = threading.Thread(target=ping_application, daemon=True)
    ping_thread.start()
    
    # Start the Flask app
    logger.info(f"Dashboard available at http://localhost:{DASHBOARD_PORT}/")
    app.run(host='0.0.0.0', port=DASHBOARD_PORT)