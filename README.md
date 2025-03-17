# SwapStyle

A retro-styled clothing swap application built with Next.js, MongoDB, and TypeScript.

## Features

- User authentication with NextAuth.js
- Location-based search for nearby items
- Real-time trade negotiation chat
- User profiles with leveling system
- Responsive retro design
- Trade completion and review system

## Prerequisites

- Node.js 18.x or later
- MongoDB 6.x or later
- npm or yarn

## Quick Start

### Windows Users
1. Clone the repository:
```bash
git clone https://github.com/yourusername/SwapStyle.git
cd SwapStyle
```

2. Run the development setup script:
```bash
dev.bat
```

### macOS/Linux Users
1. Clone the repository:
```bash
git clone https://github.com/yourusername/SwapStyle.git
cd SwapStyle
```

2. Make the development script executable:
```bash
chmod +x dev.sh
```

3. Run the development setup script:
```bash
./dev.sh
```

## Manual Setup

If you prefer to set up manually:

1. Install MongoDB:
   - Windows: Download and install from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - macOS: `brew tap mongodb/brew && brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

2. Start MongoDB:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. Install dependencies:
```bash
npm install
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/swapstyle
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run watch`: Start development server with file watching
- `npm run clean`: Clean build artifacts
- `npm run install:all`: Clean install dependencies

## Project Structure

```
swapstyle-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── browse/            # Browse items page
│   ├── chat/              # Chat/trade pages
│   └── profile/           # User profile pages
├── components/            # React components
├── lib/                   # Utility functions
├── models/               # MongoDB models
├── public/               # Static assets
└── styles/               # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js for the React framework
- MongoDB for the database
- NextAuth.js for authentication
- TypeScript for type safety
