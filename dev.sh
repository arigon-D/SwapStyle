#!/bin/bash

# Function to check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            echo "MongoDB is running"
            return 0
        else
            echo "MongoDB is not running"
            return 1
        fi
    else
        echo "MongoDB is not installed"
        return 2
    fi
}

# Function to start MongoDB
start_mongodb() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start mongodb-community
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        net start MongoDB
    else
        # Linux
        sudo systemctl start mongod
    fi
}

# Function to install dependencies
install_deps() {
    echo "Installing dependencies..."
    npm install

    # Install MongoDB if not present
    if ! command -v mongod &> /dev/null; then
        echo "MongoDB is not installed. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew tap mongodb/brew
            brew install mongodb-community
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            # Windows
            echo "Please install MongoDB manually from https://www.mongodb.com/try/download/community"
        else
            # Linux
            wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            sudo apt-get update
            sudo apt-get install -y mongodb-org
        fi
    fi
}

# Function to setup environment
setup_env() {
    if [ ! -f .env ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo "Please update the .env file with your configuration"
    fi
}

# Main execution
echo "Setting up SwapStyle development environment..."

# Check and start MongoDB
if ! check_mongodb; then
    echo "Starting MongoDB..."
    start_mongodb
    sleep 5
fi

# Install dependencies
install_deps

# Setup environment
setup_env

# Start development server
echo "Starting development server..."
npm run dev 