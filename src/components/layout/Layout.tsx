import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { Radio, LogOut } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-github-dark">
      <nav className="border-b border-github-border bg-github-dimmed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-github-accent hover:text-blue-400">
              <Radio className="w-6 h-6" />
              <span className="text-xl font-bold">Telescope</span>
            </Link>

            {isAuthenticated && (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-github-text hover:text-white">
                  Dashboard
                </Link>
                <Link to="/network" className="text-github-text hover:text-white">
                  Network Manager
                </Link>
                <Link to="/fork" className="text-github-text hover:text-white">
                  Fork Management
                </Link>
                <Link to="/profile-builder" className="text-github-text hover:text-white">
                  Profile Builder
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-github-muted hover:text-github-danger"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-github-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-github-muted">
          <p>
            Telescope - Open Source GitHub Profile Assistant |{' '}
            <a
              href="https://github.com/yourusername/telescope"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
