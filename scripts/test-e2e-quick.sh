#!/bin/bash

# Quick E2E test runner for development
echo "Running E2E tests..."
npm run test:e2e -- --project=chromium --reporter=list 2>&1 | grep -E "✓|✘|passed|failed|Error:" | head -40
echo ""
echo "Summary:"
npm run test:e2e -- --project=chromium --reporter=list 2>&1 | tail -2