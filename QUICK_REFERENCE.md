# Telescope Quick Reference

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000/telescope)
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Code Quality
npm run lint            # Check for linting errors
npm run lint:fix        # Fix linting errors
npm run type-check      # Verify TypeScript types
npm run format          # Format code with Prettier
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component with routing |
| `src/pages/HomePage.tsx` | Landing page |
| `src/pages/Dashboard.tsx` | Analytics dashboard |
| `src/pages/StarsPage.tsx` | Star management |
| `src/lib/github/api.ts` | GitHub API wrapper |
| `src/lib/github/auth.ts` | OAuth authentication |
| `src/lib/cache/storage.ts` | Browser storage utilities |
| `src/stores/*-store.ts` | Zustand state stores |

## 🔑 Environment Variables

```bash
VITE_GITHUB_CLIENT_ID=your_client_id_here
```

Get your Client ID at: https://github.com/settings/developers

## 🧪 Test Coverage

| Module | Coverage |
|--------|----------|
| Storage | 100% |
| Cache Manager | 100% |
| Auth Logic | 100% |
| Auth Store | 100% |
| **Total** | **>70%** |

## 🎯 GitHub Actions

### On Pull Request
1. Run linter
2. Type check
3. Run tests
4. Post coverage

### On Push to Main
1. All PR checks
2. Build project
3. Bundle size check
4. Deploy to GitHub Pages

## 🌐 URLs

- **Local Dev**: http://localhost:3000/telescope
- **Production**: https://yourusername.github.io/telescope
- **GitHub Repo**: https://github.com/yourusername/telescope

## 🔐 OAuth Scopes

Required GitHub API scopes:
- `user:email` - Read user profile
- `repo` - Access repositories
- `public_repo` - Star repositories
- `read:org` - Read organization data

## 📦 Bundle Size

| Asset | Size |
|-------|------|
| index.js | ~53KB (gzipped: ~15KB) |
| react-vendor.js | ~162KB (gzipped: ~53KB) |
| octokit.js | ~97KB (gzipped: ~19KB) |
| index.css | ~14KB (gzipped: ~3KB) |
| **Total** | **~1.4MB** |

## 🎨 Color Palette

```css
--github-dark: #0d1117      /* Background */
--github-dimmed: #161b22    /* Cards */
--github-border: #30363d    /* Borders */
--github-text: #c9d1d9      /* Text */
--github-muted: #8b949e     /* Muted text */
--github-accent: #58a6ff    /* Accent blue */
--github-success: #3fb950   /* Success green */
--github-danger: #f85149    /* Error red */
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| API | Octokit.js |
| Testing | Vitest |
| Hosting | GitHub Pages |

## 📊 Cache TTLs

| Data Type | TTL |
|-----------|-----|
| User Profile | 24 hours |
| Repositories | 24 hours |
| Stars | 24 hours |
| Stats | 24 hours |
| Other Users | 1 hour |

## 🔄 API Rate Limits

| Type | Limit |
|------|-------|
| Authenticated | 5,000 requests/hour |
| Search API | 30 requests/minute |

**Protection**: 1-second delay between bulk operations

## 🚨 Troubleshooting

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests fail
```bash
npm run test:watch
```

### OAuth errors
1. Check Client ID in `.env`
2. Verify callback URL in GitHub OAuth settings
3. Clear sessionStorage and try again

## 📚 Documentation

- **[README.md](./README.md)** - Overview
- **[DESIGN.md](./DESIGN.md)** - Architecture
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Setup guide
- **[CHECKLIST.md](./CHECKLIST.md)** - Implementation status

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests: `npm test`
5. Submit PR

All PRs must pass CI checks!

---

**Need help?** Open an issue or check the docs above.
