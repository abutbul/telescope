# Telescope 🔭

> **GitHub Profile Assistant** - Manage your GitHub account with intelligence

Telescope is a client-side web application that provides analytics, automation, and social features for GitHub developers. Hosted entirely on GitHub Pages with no backend required.

[![Deploy](https://github.com/yourusername/telescope/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/telescope/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **📊 Account Analytics** - Comprehensive statistics about your GitHub activity, commit history, languages, and contribution patterns
- **⭐ Star Management** - Copy stars from other users, compare star lists, and manage starred repositories efficiently
- **🔱 Fork Management** - Fork Telescope to your account and sync with upstream changes
- **🔒 Privacy First** - All operations run in your browser. No backend, no data collection
- **⚡ Smart Caching** - Intelligent browser storage caching reduces API calls
- **🎨 GitHub-Inspired UI** - Dark theme with familiar GitHub aesthetics

## 🚀 Live Demo

Visit [https://yourusername.github.io/telescope](https://yourusername.github.io/telescope) to try it out!

## 📖 Usage

1. **Sign in with GitHub** - Authenticate using GitHub's secure device flow
2. **Explore Analytics** - View comprehensive statistics about your profile
3. **Manage Stars** - Copy stars from other users or clean up your starred repos
4. **Fork & Self-Host** - Create your own version (optional)

## 🛠️ Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/telescope.git
cd telescope

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your GitHub OAuth Client ID

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run type-check` - Check TypeScript types

## 🧪 Testing

Telescope has comprehensive test coverage:

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

Tests must pass before deployment - this is enforced by GitHub Actions.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **API**: Octokit.js (GitHub REST API)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

### Project Structure

```
telescope/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── stores/         # Zustand stores
│   ├── lib/
│   │   ├── github/     # GitHub API integration
│   │   └── cache/      # Browser storage utilities
│   └── App.tsx
├── tests/              # Test files
├── public/             # Static assets
└── .github/
    └── workflows/      # CI/CD pipelines
```

## 🔐 Security

- OAuth tokens stored in `sessionStorage` (cleared on tab close)
- No backend or database - everything client-side
- Minimal OAuth scopes requested
- Content Security Policy headers
- Rate limiting protection

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs must:
- Pass all tests
- Pass linting
- Pass type checking
- Maintain test coverage > 70%

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub for their excellent API
- The open source community
- All contributors

## 🔗 Links

- [Documentation](./DESIGN.md) - Detailed design and architecture
- [GitHub API](https://docs.github.com/en/rest)
- [Report Issues](https://github.com/yourusername/telescope/issues)

---

Made with ❤️ by the open source community
