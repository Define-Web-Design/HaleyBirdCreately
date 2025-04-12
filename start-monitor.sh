
#!/bin/bash

# Start the monitoring service
echo "Starting monitoring service..."
node monitor.js &
echo "Monitoring service started in background. Check logs/monitor.log for output."
