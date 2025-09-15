#!/bin/bash
# Script to merge from a specified branch to main

echo "Available branches:"
git branch -a

echo ""
echo "Enter the branch name you want to merge into main:"
read -r source_branch

if [ -z "$source_branch" ]; then
    echo "Error: no branch given."
    exit 1
fi

# Check if the branch exists
if ! git show-ref --verify --quiet refs/heads/$source_branch; then
    echo "Error: Branch '$source_branch' does not exist locally."
    echo "Checkout the branch first or pull from remote."
    exit 1
fi

echo "Switching to main branch..."
git checkout main

echo "Pulling latest changes from main..."
git pull origin main

echo "Merging '$source_branch' into main..."
if git merge $source_branch; then
    echo "Merge successful!"
    
    echo "Push changes to remote main? (y/n):"
    read -r push_confirm
    
    if [[ $push_confirm =~ ^[Yy]$ ]]; then
        echo "Pushing to remote main..."
        git push origin main
        echo "Changes pushed to remote main successfully!"
    else
        echo "Merge completed locally. Remember to push when ready!"
    fi
else
    echo "Merge failed! Please resolve conflicts manually."
    exit 1
fi