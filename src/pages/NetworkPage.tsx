import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNetworkStore } from '../stores/network-store';
import { useStarsStore } from '../stores/stars-store';
import { Search, UserPlus, Check, Users, Star, Loader2 } from 'lucide-react';

export default function NetworkPage() {
  const token = useAuthStore((state) => state.token);
  const {
    myFollowing,
    myFollowers,
    targetUserFollowing,
    targetUserFollowers,
    targetUsername,
    isLoading: isNetworkLoading,
    copyProgress: networkCopyProgress,
    fetchMyNetwork,
    fetchUserNetwork,
    copyFollowingFromUser,
    clearTargetUser: clearNetworkTarget,
  } = useNetworkStore();

  const {
    myStars,
    targetUserStars,
    targetUsername: starsTargetUsername,
    isLoading: isStarsLoading,
    copyProgress: starsCopyProgress,
    fetchMyStars,
    fetchUserStars,
    copyStarsFromUser,
    clearTargetUser: clearStarsTarget,
  } = useStarsStore();

  const [searchUsername, setSearchUsername] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'followers' | 'following' | 'stars'>('overview');
  const [targetTab, setTargetTab] = useState<'following' | 'followers'>('following');

  useEffect(() => {
    if (token) {
      fetchMyNetwork(token);
      fetchMyStars(token);
    }
  }, [token, fetchMyNetwork, fetchMyStars]);

  const handleSearch = async () => {
    if (!token || !searchUsername) return;
    
    if (activeTab === 'stars') {
      await fetchUserStars(token, searchUsername);
      setSelectedRepos(new Set());
    } else {
      await fetchUserNetwork(token, searchUsername);
      setTargetTab('following');
      setSelectedUsers(new Set());
    }
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

  const handleSelectRepo = (fullName: string) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(fullName)) {
      newSelected.delete(fullName);
    } else {
      newSelected.add(fullName);
    }
    setSelectedRepos(newSelected);
  };

  const myFollowingLogins = new Set(myFollowing.map((u) => u.login));
  const myStarredRepoNames = new Set(myStars.map((s) => s.repo.full_name));

  const handleSelectAllUsers = () => {
    const users = targetTab === 'following' ? targetUserFollowing : targetUserFollowers;
    const allSelectable = users
      .filter((u) => !myFollowingLogins.has(u.login))
      .map((u) => u.login);
    
    if (selectedUsers.size === allSelectable.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(allSelectable));
    }
  };

  const handleSelectAllRepos = () => {
    const allSelectable = targetUserStars
      .filter((s) => !myStarredRepoNames.has(s.repo.full_name))
      .map((s) => s.repo.full_name);
    
    if (selectedRepos.size === allSelectable.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(allSelectable));
    }
  };

  const handleCopyNetwork = async () => {
    if (!token || selectedUsers.size === 0) return;

    const sourceUsers = targetTab === 'following' ? targetUserFollowing : targetUserFollowers;
    const usersToFollow = sourceUsers
      .filter((u) => selectedUsers.has(u.login));

    await copyFollowingFromUser(token, usersToFollow);
    setSelectedUsers(new Set());
    fetchMyNetwork(token, true);
  };

  const handleCopyStars = async () => {
    if (!token || selectedRepos.size === 0) return;

    const reposToCopy = targetUserStars
      .map((s) => s.repo)
      .filter((repo) => selectedRepos.has(repo.full_name));

    await copyStarsFromUser(token, reposToCopy);
    setSelectedRepos(new Set());
    fetchMyStars(token, true);
  };

  const handleFollowBackAll = async () => {
    if (!token) return;
    const usersToFollowBack = myFollowers.filter(follower => !myFollowingLogins.has(follower.login));
    if (usersToFollowBack.length === 0) return;
    
    await copyFollowingFromUser(token, usersToFollowBack);
    fetchMyNetwork(token, true);
  };

  const renderUserList = (users: typeof myFollowers, showFollowStatus = false) => {
    if (users.length === 0) {
      return <p className="text-github-muted py-4">No users found.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
        {users.map((user) => {
          const isFollowing = myFollowingLogins.has(user.login);
          return (
            <div key={user.id} className="p-3 border border-github-border rounded-lg flex items-center gap-3 bg-github-dimmed/30">
              <img src={user.avatar_url} alt={user.login} className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-semibold truncate block"
                >
                  {user.login}
                </a>
              </div>
              {showFollowStatus && isFollowing && (
                <span className="text-xs bg-github-success/20 text-github-success px-2 py-1 rounded">
                  Following
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const isLoading = isNetworkLoading || isStarsLoading;

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">Network Manager</h1>
        
        <div className="flex gap-4 mb-6 border-b border-github-border overflow-x-auto">
          <button
            className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeTab === 'overview' ? 'text-github-accent border-b-2 border-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeTab === 'followers' ? 'text-github-accent border-b-2 border-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('followers')}
          >
            My Followers ({myFollowers.length})
          </button>
          <button
            className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeTab === 'following' ? 'text-github-accent border-b-2 border-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('following')}
          >
            My Following ({myFollowing.length})
          </button>
          <button
            className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeTab === 'stars' ? 'text-github-accent border-b-2 border-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('stars')}
          >
            My Stars ({myStars.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex gap-8">
              <div className="text-center p-4 bg-github-dimmed/30 rounded-lg flex-1">
                <p className="text-github-muted mb-1">Following</p>
                <p className="text-3xl font-bold text-github-accent">{myFollowing.length}</p>
              </div>
              <div className="text-center p-4 bg-github-dimmed/30 rounded-lg flex-1">
                <p className="text-github-muted mb-1">Followers</p>
                <p className="text-3xl font-bold text-github-accent">{myFollowers.length}</p>
              </div>
              <div className="text-center p-4 bg-github-dimmed/30 rounded-lg flex-1">
                <p className="text-github-muted mb-1">Stars</p>
                <p className="text-3xl font-bold text-github-accent">{myStars.length}</p>
              </div>
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
                {isLoading ? (
                  <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 inline mr-2" />
                )}
                Search
              </button>
            </div>
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">People following you</h3>
              <button 
                onClick={handleFollowBackAll}
                disabled={networkCopyProgress.inProgress || myFollowers.every(f => myFollowingLogins.has(f.login))}
                className="btn-primary"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Follow Back All
              </button>
            </div>
            {renderUserList(myFollowers, true)}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">People you follow</h3>
            {renderUserList(myFollowing)}
          </div>
        )}

        {activeTab === 'stars' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Your Starred Repositories</h3>
            
            {/* Search for user stars */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter GitHub username to see their stars"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input flex-1"
              />
              <button onClick={handleSearch} disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 inline mr-2" />
                )}
                Search
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto border border-github-border rounded-lg p-4 bg-github-dimmed/30">
              {myStars.length === 0 ? (
                <p className="text-github-muted">No starred repositories yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {myStars.map((star) => (
                    <div key={star.repo.id} className="flex justify-between items-center p-2 hover:bg-github-dimmed rounded transition-colors">
                      <a 
                        href={star.repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link truncate mr-2"
                        title={star.repo.full_name}
                      >
                        {star.repo.full_name}
                      </a>
                      <span className="text-xs text-github-muted whitespace-nowrap">⭐ {star.repo.stargazers_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Network Copy Progress */}
      {networkCopyProgress.inProgress && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Following Users...</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Progress: {networkCopyProgress.completed} / {networkCopyProgress.total}
              </span>
              {networkCopyProgress.failed > 0 && (
                <span className="text-github-danger">Failed: {networkCopyProgress.failed}</span>
              )}
            </div>
            <div className="w-full h-2 bg-github-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-github-accent transition-all"
                style={{
                  width: `${(networkCopyProgress.completed / networkCopyProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stars Copy Progress */}
      {starsCopyProgress.inProgress && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Copying Stars...</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Progress: {starsCopyProgress.completed} / {starsCopyProgress.total}
              </span>
              {starsCopyProgress.failed > 0 && (
                <span className="text-github-danger">Failed: {starsCopyProgress.failed}</span>
              )}
            </div>
            <div className="w-full h-2 bg-github-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-github-accent transition-all"
                style={{
                  width: `${(starsCopyProgress.completed / starsCopyProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Target User Network */}
      {targetUsername && !isNetworkLoading && activeTab !== 'stars' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{targetUsername}'s Network</h2>
              <div className="flex bg-github-dimmed rounded-lg p-1">
                <button
                  onClick={() => {
                    setTargetTab('following');
                    setSelectedUsers(new Set());
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    targetTab === 'following'
                      ? 'bg-github-accent text-white'
                      : 'text-github-muted hover:text-white'
                  }`}
                >
                  Following ({targetUserFollowing.length})
                </button>
                <button
                  onClick={() => {
                    setTargetTab('followers');
                    setSelectedUsers(new Set());
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    targetTab === 'followers'
                      ? 'bg-github-accent text-white'
                      : 'text-github-muted hover:text-white'
                  }`}
                >
                  Followers ({targetUserFollowers.length})
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSelectAllUsers}
                className="btn-secondary"
                disabled={(targetTab === 'following' ? targetUserFollowing : targetUserFollowers).length === 0}
              >
                {selectedUsers.size === (targetTab === 'following' ? targetUserFollowing : targetUserFollowers).filter(u => !myFollowingLogins.has(u.login)).length && selectedUsers.size > 0
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>
              <button
                onClick={handleCopyNetwork}
                disabled={selectedUsers.size === 0 || networkCopyProgress.inProgress || (targetTab === 'following' ? targetUserFollowing : targetUserFollowers).length === 0}
                className="btn-primary"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Follow {selectedUsers.size} Selected
              </button>
              <button onClick={clearNetworkTarget} className="btn-secondary">
                Clear
              </button>
            </div>
          </div>

          {(targetTab === 'following' ? targetUserFollowing : targetUserFollowers).length === 0 ? (
            <div className="text-center py-8 text-github-muted">
              <p className="text-lg">This user {targetTab === 'following' ? 'is not following anyone' : 'has no followers'}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {(targetTab === 'following' ? targetUserFollowing : targetUserFollowers).map((user) => {
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

      {/* Target User Stars */}
      {starsTargetUsername && !isStarsLoading && activeTab === 'stars' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {starsTargetUsername}'s Stars ({targetUserStars.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllRepos}
                className="btn-secondary"
                disabled={targetUserStars.length === 0}
              >
                {selectedRepos.size === targetUserStars.filter(s => !myStarredRepoNames.has(s.repo.full_name)).length && selectedRepos.size > 0
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>
              <button
                onClick={handleCopyStars}
                disabled={selectedRepos.size === 0 || starsCopyProgress.inProgress || targetUserStars.length === 0}
                className="btn-primary"
              >
                <Star className="w-4 h-4 inline mr-2" />
                Copy {selectedRepos.size} Selected
              </button>
              <button onClick={clearStarsTarget} className="btn-secondary">
                Clear
              </button>
            </div>
          </div>

          {targetUserStars.length === 0 ? (
            <div className="text-center py-8 text-github-muted">
              <p className="text-lg">This user hasn't starred any repositories yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {targetUserStars.map((star) => {
              const repo = star.repo;
              const isAlreadyStarred = myStarredRepoNames.has(repo.full_name);
              const isSelected = selectedRepos.has(repo.full_name);

              return (
                <div
                  key={repo.id}
                  onClick={() => !isAlreadyStarred && handleSelectRepo(repo.full_name)}
                  className={`p-4 border border-github-border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-github-accent/10 border-github-accent'
                      : isAlreadyStarred
                      ? 'bg-github-dimmed/50 cursor-not-allowed opacity-50'
                      : 'hover:bg-github-dimmed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link text-lg font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {repo.full_name}
                        </a>
                        {isAlreadyStarred && (
                          <span className="text-xs bg-github-success/20 text-github-success px-2 py-1 rounded">
                            Already Starred
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-github-muted text-sm mt-1">{repo.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-github-muted">
                        {repo.language && <span>{repo.language}</span>}
                        <span>⭐ {repo.stargazers_count}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isAlreadyStarred ? (
                        <Check className="w-6 h-6 text-github-success" />
                      ) : isSelected ? (
                        <Check className="w-6 h-6 text-github-accent" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-github-border rounded" />
                      )}
                    </div>
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
