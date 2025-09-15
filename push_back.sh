#!/bin/bash

# Script to commit changes to the backend branch    

echo "Switching to backend directory..."
cd gastos || { echo "Backend directory not found!"; exit 1; }

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

echo "Pushing to remote backend branch..."
git push origin backend

echo "Backend changes committed and pushed successfully."