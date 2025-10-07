#!/bin/bash
set -e
echo "--- Changing directory to functions ---"
cd functions
echo "--- Installing dependencies with yarn ---"
yarn install
echo "--- Building with yarn ---"
yarn run build
echo "--- Build script finished ---"