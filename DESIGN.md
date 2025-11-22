# Telescope - GitHub Profile Assistant

## Product Vision

Telescope is a client-side web application hosted on GitHub Pages that empowers developers to manage their GitHub profiles intelligently. It provides analytics, automation, and social features that aren't available in the standard GitHub API or interface.

## Core Concept

A **self-hosted, privacy-first GitHub account management tool** that runs entirely in the browser. Users authenticate via GitHub OAuth, and all operations are performed client-side using the GitHub API, with data cached locally in browser storage.

## Key Features

### 1. Account Analytics & Infographics
- **Account Age**: Time since account creation
- **Commit History**: Visual timeline of commits across all repositories
- **Contribution Heatmap**: Activity patterns over time
- **Language Statistics**: Primary languages used across repositories
- **Star Analytics**: Most starred repos, trending interests
- **Follower/Following Growth**: Historical tracking
- **Repository Metrics**: Public/private ratio, fork counts, issue activity

**Data Caching**: All analytics data cached in `localStorage` with configurable TTL (default: 24 hours)

### 2. Star Management
- **Copy Stars from User**: Enter any GitHub username to view their starred repositories
- **Bulk Star Operation**: Select and star multiple repositories at once
- **Star Comparison**: See which stars you have in common with another user
- **Unstar Suggestions**: Identify inactive or archived repos to clean up
- **Star Export/Import**: Backup and restore your stars

### 3. Self-Hosting & Fork Management
- **One-Click Fork**: Fork the Telescope repository to your account
- **Auto-Deploy**: GitHub Actions automatically deploys your fork to GitHub Pages
- **Upstream Sync**: Merge updates from the original repository with conflict detection
- **Custom Branding**: Personalize your fork with custom themes and settings

### 4. Future Extensions (Roadmap)
- Repository health scoring
- Automated README generation
- Issue/PR templates management
- Batch repository operations (archive, delete, visibility changes)
- GitHub Actions workflow templates
- Team collaboration analytics

## Technical Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast, optimized for GitHub Pages)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (lightweight, persistent)
- **API Client**: Octokit.js (official GitHub API SDK)
- **Charts**: Recharts for data visualization
- **Testing**: Vitest + React Testing Library

### Authentication Flow
```
1. User clicks "Sign in with GitHub"
2. Redirect to GitHub OAuth (with required scopes)
3. GitHub redirects back with code
4. Exchange code for access token (using GitHub Pages proxy or netlify functions fallback)
5. Store token securely in sessionStorage (cleared on tab close)
6. Use token for all GitHub API calls
```

**OAuth Scopes Required**:
- `user:email` - Read user profile
- `repo` - Read repository data
- `public_repo` - Star repositories
- `read:org` - Read organization data

### Data Storage Strategy

#### localStorage (Persistent)
- Cached API responses (with timestamps)
- User preferences
- Analytics history
- Star lists

#### sessionStorage (Temporary)
- OAuth access token
- Current session data

#### Storage Schema
```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface UserCache {
  profile: CacheEntry<UserProfile>;
  repos: CacheEntry<Repository[]>;
  commits: CacheEntry<CommitHistory>;
  stars: CacheEntry<StarredRepo[]>;
}
```

### GitHub Pages Deployment
- Static hosting on `https://<username>.github.io/telescope`
- No backend required (fully client-side)
- GitHub Actions workflow for CI/CD
- Automated testing before deployment
- Cache invalidation on new deploys

## Security Considerations

1. **Token Storage**: OAuth tokens stored in `sessionStorage` (not `localStorage`) to prevent XSS persistence
2. **Scopes**: Request minimal OAuth scopes needed
3. **Rate Limiting**: Implement exponential backoff for GitHub API calls
4. **CORS**: All API calls go directly to `api.github.com` (no CORS issues)
5. **No Backend**: Zero server-side vulnerability surface
6. **Content Security Policy**: Strict CSP headers via `_headers` file

## API Rate Limiting Strategy

GitHub API limits:
- **Authenticated**: 5,000 requests/hour
- **Search API**: 30 requests/minute

**Mitigation**:
- Aggressive caching with smart TTLs
- Batch API requests using GraphQL
- Display rate limit status to user
- Queue and throttle bulk operations

## Testing Strategy

### Unit Tests
- Utility functions (date formatting, data transformations)
- Cache management logic
- API client wrappers

### Integration Tests
- GitHub API mocking with MSW (Mock Service Worker)
- OAuth flow simulation
- Star copying workflow
- Data persistence and retrieval

### E2E Tests
- Playwright for critical user journeys
- Authentication flow
- Star copying end-to-end
- Fork and sync operations

### Pre-Deployment Gates
- All tests must pass (100% critical path coverage)
- TypeScript compilation without errors
- Build output under 1MB (initial bundle)
- Lighthouse score > 90

## CI/CD Pipeline (GitHub Actions)

```yaml
Workflow Steps:
1. Install dependencies
2. Run linter (ESLint)
3. Type check (TypeScript)
4. Run unit tests (Vitest)
5. Run integration tests
6. Build production bundle
7. Run bundle size check
8. Deploy to GitHub Pages (only on main branch)
```

## File Structure

```
telescope/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # CI/CD pipeline
│       └── test.yml            # PR testing
├── public/
│   ├── _headers               # Security headers
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx
│   │   │   └── AuthCallback.tsx
│   │   ├── analytics/
│   │   │   ├── AccountStats.tsx
│   │   │   ├── CommitHeatmap.tsx
│   │   │   └── LanguageChart.tsx
│   │   ├── stars/
│   │   │   ├── StarCopier.tsx
│   │   │   ├── StarList.tsx
│   │   │   └── StarComparison.tsx
│   │   └── fork/
│   │       ├── ForkManager.tsx
│   │       └── SyncUpstream.tsx
│   ├── lib/
│   │   ├── github/
│   │   │   ├── api.ts          # GitHub API wrapper
│   │   │   ├── auth.ts         # OAuth logic
│   │   │   └── types.ts        # API type definitions
│   │   ├── cache/
│   │   │   ├── storage.ts      # Browser storage utilities
│   │   │   └── cache-manager.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       └── format.ts
│   ├── stores/
│   │   ├── auth-store.ts       # Authentication state
│   │   ├── user-store.ts       # User data state
│   │   └── stars-store.ts      # Star management state
│   ├── hooks/
│   │   ├── useGitHubAPI.ts
│   │   ├── useCache.ts
│   │   └── useStars.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── .env.example
├── DESIGN.md                   # This file
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vitest.config.ts
```

## User Journey

### First-Time User
1. Land on homepage with feature showcase
2. Click "Sign in with GitHub"
3. Authorize Telescope with required permissions
4. Redirected to dashboard with account analytics loading
5. Explore stats while data caches in background
6. Try star copying feature
7. (Optional) Fork Telescope to their account

### Returning User
1. Land on homepage
2. Click "Sign in with GitHub"
3. Instant dashboard load from cache
4. Background refresh of stale data
5. Continue with actions

## OAuth Configuration

For GitHub Pages deployment, OAuth requires:
- **Client ID**: Public, stored in code
- **Client Secret**: Required for token exchange (problem for static sites)

**Solution**: Use GitHub's device flow or a lightweight proxy:
- Option A: GitHub Device Flow (no redirect URI needed)
- Option B: Minimal Cloudflare Worker for token exchange
- Option C: GitHub OAuth via Netlify/Vercel serverless function

**Recommended**: Use a simple redirect to the OAuth flow and handle the token in the callback URL fragment (implicit grant flow is deprecated, so we'll use device flow).

## Branding & Design

- **Name**: Telescope (because it helps you see further into GitHub)
- **Color Scheme**: Dark theme with GitHub-inspired blues and purples
- **Logo**: Stylized telescope icon
- **Typography**: Inter for UI, JetBrains Mono for code

## Success Metrics

- **Adoption**: Number of forks of the project
- **Engagement**: Average session duration
- **Utility**: Number of stars copied
- **Performance**: Sub-second page loads
- **Quality**: Zero critical bugs in production

## Open Source & Community

- **License**: MIT
- **Contributions**: Welcome via PRs
- **Documentation**: Comprehensive README and inline comments
- **Community**: GitHub Discussions for feature requests

---

## Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Basic authentication (GitHub OAuth)
- [ ] Account stats dashboard
- [ ] Star copying from another user
- [ ] Browser storage caching
- [ ] Responsive UI with Tailwind

### Phase 2: Enhancement (Week 3-4)
- [ ] Advanced analytics (charts, heatmaps)
- [ ] Star comparison features
- [ ] Fork management UI
- [ ] Upstream sync functionality
- [ ] Comprehensive testing

### Phase 3: Polish (Week 5-6)
- [ ] Performance optimization
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Documentation and guides
- [ ] Community features
- [ ] Marketing site

---

*Last Updated: November 22, 2025*
