# Getting Started with Telescope

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your GitHub OAuth Client ID
# You can use the default for testing, or create your own at:
# https://github.com/settings/developers
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/telescope` in your browser.

### 4. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## GitHub OAuth Setup

To use your own GitHub OAuth app:

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Telescope (or your preferred name)
   - **Homepage URL**: `https://yourusername.github.io/telescope`
   - **Authorization callback URL**: `https://yourusername.github.io/telescope/callback`
   - For local development, also add: `http://localhost:3000/telescope/callback`
4. Copy the **Client ID**
5. Update `VITE_GITHUB_CLIENT_ID` in `.env`

**Note**: For static sites, we use GitHub's Device Flow authentication, so you don't need to worry about the client secret.

## Deployment to GitHub Pages

### Option 1: Deploy Your Fork

1. Fork this repository
2. Go to your fork's Settings → Pages
3. Under "Build and deployment", select "GitHub Actions"
4. Push to main branch
5. GitHub Actions will automatically:
   - Run tests
   - Build the project
   - Deploy to GitHub Pages

Your site will be available at: `https://yourusername.github.io/telescope`

### Option 2: Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting service
```

## Project Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Check TypeScript types
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## CI/CD Pipeline

When you push to GitHub, the following happens automatically:

### On Pull Requests:
- Run linter
- Run type checker
- Run all tests
- Comment with coverage report

### On Push to Main:
- Run all quality checks
- Build production bundle
- Check bundle size (< 2MB)
- Deploy to GitHub Pages

## Troubleshooting

### OAuth Authentication Issues

If authentication fails:
1. Check that your Client ID is correct in `.env`
2. Verify the callback URL matches in GitHub OAuth settings
3. Make sure you're using the correct domain (localhost for dev, yourusername.github.io for production)

### Build Failures

If the build fails:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Test Failures

If tests fail:
```bash
# Run tests in watch mode to see details
npm run test:watch

# Check test coverage
npm run test:coverage
```

## Browser Support

Telescope supports all modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Privacy & Security

- All data processing happens in your browser
- OAuth tokens are stored in sessionStorage (cleared when tab closes)
- No backend servers or databases
- No tracking or analytics
- Open source and auditable

## Contributing

See [DESIGN.md](./DESIGN.md) for architecture details.

Pull requests welcome! Make sure:
- All tests pass (`npm test`)
- Code is linted (`npm run lint`)
- Types check (`npm run type-check`)
- Coverage stays above 70%

## License

MIT License - see [LICENSE](./LICENSE) file.

## Support

- [Open an issue](https://github.com/yourusername/telescope/issues)
- [Read the docs](./DESIGN.md)
- [View examples](./README.md)

---

**Happy coding!** 🔭
