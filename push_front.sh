#!/bin/bash
# Script to commit changes to the frontend branch

echo "Switching to frontend directory..."

cd frontend || { echo "Frontend directory not found!"; exit 1; }

echo "Adding all changes..."
git add .

echo "Commit message:"
read -r commit_message

if [ -z "$commit_message" ]; then
    echo "Error: Commit message empty."
    exit 1
fi

echo "Committing changes..."
git commit -m "$commit_message"

echo "Pushing to remote frontend branch..."
git push origin frontend

echo "Frontend changes committed and pushed successfully."