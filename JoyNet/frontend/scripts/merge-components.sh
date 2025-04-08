#!/bin/bash

# Copy AI-related components
cp -r "../../React Frontend/components/ai/"* "./components/ai/"
cp -r "../../React Frontend/components/chat/"* "./components/chat/"

# Copy community components
cp -r "../../React Frontend/components/community/"* "./components/community/"

# Copy utility components that don't conflict
cp -r "../../React Frontend/components/ui/"* "./components/ui/"

# Copy hooks and utilities
cp -r "../../React Frontend/utils/"* "./utils/"

echo "Components merged successfully.