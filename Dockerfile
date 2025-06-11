# Multi-stage build for JoyNet decentralized platform

# Stage 1: Build frontend
FROM node:16-alpine AS frontend-builder
WORKDIR /app
COPY unified-frontend/package*.json ./
RUN npm install
COPY unified-frontend/ ./
RUN npm run build

# Stage 2: Build Python backend
FROM python:3.9-slim AS backend-builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
COPY config/ ./config/
RUN python -m compileall src/

# Stage 3: Final image
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ipfs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python backend
COPY --from=backend-builder /app/src/ ./src/
COPY --from=backend-builder /app/config/ ./config/

# Copy frontend build
COPY --from=frontend-builder /app/build/ ./unified-frontend/build/

# Copy additional files
COPY scripts/ ./scripts/
COPY contracts/ ./contracts/
COPY models/ ./models/

# Set up environment
ENV NODE_ENV=production
ENV PYTHONPATH=/app
ENV PATH="/app/scripts:${PATH}"

# Expose ports
EXPOSE 3000 4001 5001 8080

# Set up entrypoint
COPY deployment/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "-m", "src.p2p.node_network"]