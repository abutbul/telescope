import { Link } from 'react-router-dom';
import { Radio, Star, BarChart, GitFork, Shield, Zap } from 'lucide-react';
import LoginButton from '../components/auth/LoginButton';
import { useAuthStore } from '../stores/auth-store';

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="flex justify-center mb-6">
          <Radio className="w-24 h-24 text-github-accent" />
        </div>
        <h1 className="text-5xl font-bold mb-6">
          Telescope
        </h1>
        <p className="text-xl text-github-muted max-w-2xl mx-auto mb-8">
          Manage your GitHub profile with intelligence. Analytics, automation, and insights
          for developers.
        </p>
        {!isAuthenticated ? (
          <LoginButton />
        ) : (
          <Link to="/dashboard" className="btn-primary inline-block">
            Go to Dashboard
          </Link>
        )}
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <BarChart className="w-12 h-12 text-github-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Account Analytics</h3>
            <p className="text-github-muted">
              Comprehensive statistics about your GitHub activity, commit history, languages,
              and contribution patterns.
            </p>
          </div>

          <div className="card">
            <Star className="w-12 h-12 text-github-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Star Management</h3>
            <p className="text-github-muted">
              Copy stars from other users, compare star lists, and manage your starred
              repositories efficiently.
            </p>
          </div>

          <div className="card">
            <GitFork className="w-12 h-12 text-github-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Fork Management</h3>
            <p className="text-github-muted">
              Fork Telescope to your account, sync with upstream, and maintain your own
              self-hosted version.
            </p>
          </div>

          <div className="card">
            <Shield className="w-12 h-12 text-github-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Privacy First</h3>
            <p className="text-github-muted">
              All operations run in your browser. No backend servers, no data collection.
              Your tokens stay local.
            </p>
          </div>

          <div className="card">
            <Zap className="w-12 h-12 text-github-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Caching</h3>
            <p className="text-github-muted">
              Intelligent browser storage caching reduces API calls and provides instant
              access to your data.
            </p>
          </div>

          <div className="card">
            <Radio className="w-12 h-12 text-github-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Open Source</h3>
            <p className="text-github-muted">
              Fully open source under MIT license. Fork it, customize it, and contribute
              back to the community.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="card max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <h4 className="font-bold mb-1">Authenticate with GitHub</h4>
              <p className="text-github-muted">
                Sign in using GitHub's secure device flow authentication.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <h4 className="font-bold mb-1">Explore Your Analytics</h4>
              <p className="text-github-muted">
                View comprehensive statistics and insights about your GitHub profile.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <h4 className="font-bold mb-1">Take Actions</h4>
              <p className="text-github-muted">
                Copy stars, manage repositories, and perform bulk operations.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              4
            </span>
            <div>
              <h4 className="font-bold mb-1">Fork & Self-Host (Optional)</h4>
              <p className="text-github-muted">
                Create your own version by forking the repository to your GitHub account.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
