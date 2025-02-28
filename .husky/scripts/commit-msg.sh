#!/bin/bash

# Make sure we're on Unix LF, not Windows CRLF
commit_msg_file="$1"
commit_msg=$(cat "$commit_msg_file" | tr -d '\r')

# Conventional Commit Pattern
# Format: <type>[(scope)]: <description>
# Types: feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert
commit_pattern='^((Merge.*)|((feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert|merge)(\([a-z0-9-]+\))?: .+))$'

if ! echo "$commit_msg" | grep -qE "$commit_pattern"; then
    echo "Error: Commit message format is invalid"
    echo "Valid format: <type>[optional scope]: <description>"
    echo "Types: feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert"
    echo "Example: feat(auth): add login functionality"
    echo "Your commit message: $commit_msg"
    exit 1
fi

# Check first line length
first_line=$(echo "$commit_msg" | head -n 1)
if [ ${#first_line} -gt 175 ]; then
    echo "Error: First line of commit message is too long (max 175 characters)"
    echo "Length: ${#first_line} characters"
    exit 1
fi

# If there's a body, ensure there's a blank line after the subject
if [ $(echo "$commit_msg" | wc -l) -gt 1 ]; then
    second_line=$(echo "$commit_msg" | sed -n '2p')
    if [ ! -z "$second_line" ]; then
        echo "Error: Second line must be blank"
        exit 1
    fi
fi

exit 0
