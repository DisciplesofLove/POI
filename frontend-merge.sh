#!/bin/bash

# Create backup of current frontend
cp -r JoyNet/frontend JoyNet/frontend.backup

# Move React Frontend components to JoyNet
cp -r "React Frontend/components/"* "JoyNet/frontend/components/"

# Copy utilities and hooks
cp -r "React Frontend/utils/"* "JoyNet/frontend/utils/"

# Copy pages
cp -r "React Frontend/pages/"* "JoyNet/frontend/pages/"

# Copy styles
mkdir -p "JoyNet/frontend/styles"
cp -r "React Frontend/styles/"* "JoyNet/frontend/styles/"

# Update package.json with merged dependencies
# Note: Manual review required for dependency conflicts

mv JoyNet/frontend/package.json.new JoyNet/frontend/package.json
npm install --prefix JoyNet/frontend
echo "Frontend files merged and dependencies updated."