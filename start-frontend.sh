#!/bin/bash
echo "Starting React Frontend with Vite..."
echo "Backend configured to connect to Spring Boot at localhost:8080"
cd /home/runner/workspace
exec npx vite --host 0.0.0.0 --port 5000