#!/bin/bash

# Gemini CLI GitHub Actions Setup Script
# This script sets up Gemini CLI for use in GitHub Actions

set -e

echo "🚀 Setting up Gemini CLI for GitHub Actions..."

# Check if we're in a GitHub Actions environment
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "✅ Running in GitHub Actions environment"
else
    echo "⚠️  Not running in GitHub Actions environment"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Build the project
echo "🔨 Building Gemini CLI..."
npm run build

# Install Gemini CLI globally
echo "🔗 Installing Gemini CLI globally..."
npm link

# Verify installation
echo "✅ Verifying Gemini CLI installation..."
gemini --version

# Set up API keys if available
if [ -n "$GEMINI_API_KEY" ]; then
    echo "🔑 GEMINI_API_KEY is set"
    export GEMINI_API_KEY="$GEMINI_API_KEY"
elif [ -n "$GOOGLE_API_KEY" ]; then
    echo "🔑 GOOGLE_API_KEY is set"
    export GOOGLE_API_KEY="$GOOGLE_API_KEY"
    export GOOGLE_GENAI_USE_VERTEXAI=true
else
    echo "⚠️  No API key found, using default authentication"
fi

# Test basic functionality
echo "🧪 Testing Gemini CLI basic functionality..."
gemini -p "Hello, this is a test" --version || {
    echo "⚠️  Basic test failed, but continuing..."
}

echo "✅ Gemini CLI setup completed successfully!"

# List available tools
echo "🔧 Available tools:"
gemini --list-extensions || echo "Could not list extensions"

echo "🎉 Setup complete! Gemini CLI is ready to use in GitHub Actions." 