import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNetworkStore } from '../stores/network-store';
import { Search, UserPlus, Check } from 'lucide-react';

export default function NetworkPage() {
  const token = useAuthStore((state) => state.token);
  const {
    myFollowing,
    myFollowers,
    targetUserFollowing,
    targetUsername,
    isLoading,
    copyProgress,
    fetchMyNetwork,
    fetchUserNetwork,
    copyFollowingFromUser,
    clearTargetUser,
  } = useNetworkStore();

  const [searchUsername, setSearchUsername] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (token) {
      fetchMyNetwork(token);
    }
  }, [token, fetchMyNetwork]);

  const handleSearch = async () => {
    if (!token || !searchUsername) return;
    await fetchUserNetwork(token, searchUsername);
  };

  const handleSelectUser = (login: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(login)) {
      newSelected.delete(login);
    } else {
      newSelected.add(login);
    }
    setSelectedUsers(newSelected);
  };

  const handleCopyFollowing = async () => {
    if (!token || selectedUsers.size === 0) return;

    const usersToFollow = targetUserFollowing
      .filter((u) => selectedUsers.has(u.login));

    await copyFollowingFromUser(token, usersToFollow);
    setSelectedUsers(new Set());
    fetchMyNetwork(token, true);
  };

  const myFollowingLogins = new Set(myFollowing.map((u) => u.login));

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">Network Management</h1>
        <div className="flex gap-8 mb-6">
            <p className="text-github-muted">
            Following: <span className="text-github-accent font-bold">{myFollowing.length}</span>
            </p>
            <p className="text-github-muted">
            Followers: <span className="text-github-accent font-bold">{myFollowers.length}</span>
            </p>
        </div>

        {/* Search for user */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter GitHub username to see who they follow"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input flex-1"
          />
          <button onClick={handleSearch} disabled={isLoading} className="btn-primary">
            <Search className="w-5 h-5 inline mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Copy Progress */}
      {copyProgress.inProgress && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Following Users...</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Progress: {copyProgress.completed} / {copyProgress.total}
              </span>
              {copyProgress.failed > 0 && (
                <span className="text-github-danger">Failed: {copyProgress.failed}</span>
              )}
            </div>
            <div className="w-full h-2 bg-github-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-github-accent transition-all"
                style={{
                  width: `${(copyProgress.completed / copyProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Target User Following */}
      {targetUsername && !isLoading && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {targetUsername} follows ({targetUserFollowing.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopyFollowing}
                disabled={selectedUsers.size === 0 || copyProgress.inProgress || targetUserFollowing.length === 0}
                className="btn-primary"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Follow {selectedUsers.size} Selected
              </button>
              <button onClick={clearTargetUser} className="btn-secondary">
                Clear
              </button>
            </div>
          </div>

          {targetUserFollowing.length === 0 ? (
            <div className="text-center py-8 text-github-muted">
              <p className="text-lg">This user is not following anyone.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {targetUserFollowing.map((user) => {
              const isAlreadyFollowing = myFollowingLogins.has(user.login);
              const isSelected = selectedUsers.has(user.login);

              return (
                <div
                  key={user.id}
                  onClick={() => !isAlreadyFollowing && handleSelectUser(user.login)}
                  className={`p-4 border border-github-border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    isSelected
                      ? 'bg-github-accent/10 border-github-accent'
                      : isAlreadyFollowing
                      ? 'bg-github-dimmed/50 cursor-not-allowed opacity-50'
                      : 'hover:bg-github-dimmed'
                  }`}
                >
                  <img src={user.avatar_url} alt={user.login} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link font-semibold truncate block"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {user.login}
                    </a>
                  </div>
                  <div>
                    {isAlreadyFollowing ? (
                        <Check className="w-5 h-5 text-github-success" />
                    ) : isSelected ? (
                        <Check className="w-5 h-5 text-github-accent" />
                    ) : (
                        <div className="w-5 h-5 border-2 border-github-border rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
