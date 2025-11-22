import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';

export default function AuthCallback() {
  const navigate = useNavigate();
  const completeAuth = useAuthStore((state) => state.completeAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get token from URL fragment (OAuth)
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');

    if (token) {
      completeAuth(token);
      navigate('/dashboard');
    } else {
      setError('No authentication token received');
    }
  }, [completeAuth, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md">
          <h2 className="text-2xl font-bold text-github-danger mb-4">Authentication Error</h2>
          <p className="text-github-muted">{error}</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card">
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold mb-4">Completing authentication...</h2>
          <div className="h-2 bg-github-accent rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
