import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { Github } from 'lucide-react';

export default function LoginButton() {
  const { isAuthenticated, isLoading, deviceCode, verificationUri, startDeviceFlow } = useAuthStore();
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (deviceCode && verificationUri) {
      setShowInstructions(true);
    }
  }, [deviceCode, verificationUri]);

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async () => {
    await startDeviceFlow();
  };

  if (showInstructions && deviceCode && verificationUri) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="card max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Complete Authentication</h2>
          <div className="space-y-4">
            <p className="text-github-muted">
              To authenticate with GitHub, please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-github-text">
              <li>
                Visit:{' '}
                <a href={verificationUri} target="_blank" rel="noopener noreferrer" className="link">
                  {verificationUri}
                </a>
              </li>
              <li>
                Enter this code:{' '}
                <code className="bg-github-dark px-2 py-1 rounded text-github-accent font-mono text-lg">
                  {deviceCode}
                </code>
              </li>
              <li>Authorize Telescope to access your GitHub account</li>
            </ol>
            <div className="flex items-center justify-center pt-4">
              <div className="animate-spin h-8 w-8 border-4 border-github-accent border-t-transparent rounded-full"></div>
              <span className="ml-3 text-github-muted">Waiting for authorization...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} disabled={isLoading} className="btn-primary flex items-center gap-2">
      <Github className="w-5 h-5" />
      {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
    </button>
  );
}
