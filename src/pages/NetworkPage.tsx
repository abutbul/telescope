import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNetworkStore } from '../stores/network-store';
import { useStarsStore } from '../stores/stars-store';
import { Search, UserPlus, Check, Users, Star, Loader2, Info, Sparkles } from 'lucide-react';

type TabType = 'overview' | 'followers' | 'following' | 'stars';

// Persist tab state in sessionStorage so refresh keeps you on the same tab
const getInitialTab = (): TabType => {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('networkPageTab');
    if (saved && ['overview', 'followers', 'following', 'stars'].includes(saved)) {
      return saved as TabType;
    }
  }
  return 'overview';
};

// Reusable attention box component for feature highlights
function FeatureBox({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  variant = 'info' 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  children?: React.ReactNode;
  variant?: 'info' | 'action' | 'success';
}) {
  const variants = {
    info: 'border-blue-500/30 bg-blue-500/5',
    action: 'border-purple-500/30 bg-purple-500/5',
    success: 'border-green-500/30 bg-green-500/5',
  };
  const iconColors = {
    info: 'text-blue-400',
    action: 'text-purple-400',
    success: 'text-green-400',
  };

  return (
    <div className={`rounded-lg border-2 ${variants[variant]} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-github-dimmed ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-github-fg mb-1">{title}</h4>
          <p className="text-sm text-github-muted mb-3">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [targetTab, setTargetTab] = useState<'following' | 'followers'>('following');

  // Persist tab changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('networkPageTab', activeTab);
  }, [activeTab]);

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
  const myFollowersLogins = new Set(myFollowers.map((u) => u.login));
  const myStarredRepoNames = new Set(myStars.map((s) => s.repo.full_name));

  // Calculate users not yet followed back
  const usersNotFollowedBack = myFollowers.filter(f => !myFollowingLogins.has(f.login));
  // Calculate users I follow who don't follow me back
  const usersNotFollowingBack = myFollowing.filter(f => !myFollowersLogins.has(f.login));

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
    if (usersNotFollowedBack.length === 0) return;
    
    await copyFollowingFromUser(token, usersNotFollowedBack);
    fetchMyNetwork(token, true);
  };

  const renderUserList = (users: typeof myFollowers, statusType: 'none' | 'following' | 'follows-back' = 'none') => {
    if (users.length === 0) {
      return <p className="text-github-muted py-4 text-center">No users found.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
        {users.map((user) => {
          const isFollowing = myFollowingLogins.has(user.login);
          const followsMe = myFollowersLogins.has(user.login);
          
          return (
            <div key={user.id} className="p-3 border border-github-border rounded-lg flex items-center gap-3 bg-github-dimmed/30 hover:bg-github-dimmed/50 transition-colors">
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
              {statusType === 'following' && (
                <span className={`text-xs px-2 py-1 rounded ${
                  isFollowing 
                    ? 'bg-github-success/20 text-github-success' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {isFollowing ? 'Following' : 'Not following'}
                </span>
              )}
              {statusType === 'follows-back' && (
                <span className={`text-xs px-2 py-1 rounded ${
                  followsMe 
                    ? 'bg-github-success/20 text-github-success' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {followsMe ? 'Follows you' : 'Not following you'}
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
    <div className="space-y-6">
      {/* Header Card with Tabs */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Network Manager</h1>
        <p className="text-github-muted mb-6">Manage your GitHub network, discover new connections, and organize your stars.</p>
        
        <div className="flex gap-2 border-b border-github-border overflow-x-auto pb-px">
          <button
            className={`pb-3 px-4 font-semibold whitespace-nowrap transition-colors relative ${activeTab === 'overview' ? 'text-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-github-accent" />}
          </button>
          <button
            className={`pb-3 px-4 font-semibold whitespace-nowrap transition-colors relative ${activeTab === 'followers' ? 'text-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('followers')}
          >
            My Followers ({myFollowers.length})
            {activeTab === 'followers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-github-accent" />}
          </button>
          <button
            className={`pb-3 px-4 font-semibold whitespace-nowrap transition-colors relative ${activeTab === 'following' ? 'text-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('following')}
          >
            My Following ({myFollowing.length})
            {activeTab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-github-accent" />}
          </button>
          <button
            className={`pb-3 px-4 font-semibold whitespace-nowrap transition-colors relative ${activeTab === 'stars' ? 'text-github-accent' : 'text-github-muted hover:text-github-fg'}`}
            onClick={() => setActiveTab('stars')}
          >
            My Stars ({myStars.length})
            {activeTab === 'stars' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-github-accent" />}
          </button>
        </div>
      </div>

      {/* Progress Indicators */}
      {networkCopyProgress.inProgress && (
        <div className="card border-github-accent/50">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-github-accent animate-spin" />
            <h3 className="text-lg font-bold">Following Users...</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {networkCopyProgress.completed} / {networkCopyProgress.total}</span>
              {networkCopyProgress.failed > 0 && (
                <span className="text-github-danger">Failed: {networkCopyProgress.failed}</span>
              )}
            </div>
            <div className="w-full h-2 bg-github-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-github-accent transition-all duration-300"
                style={{ width: `${(networkCopyProgress.completed / networkCopyProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {starsCopyProgress.inProgress && (
        <div className="card border-github-accent/50">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-github-accent animate-spin" />
            <h3 className="text-lg font-bold">Copying Stars...</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {starsCopyProgress.completed} / {starsCopyProgress.total}</span>
              {starsCopyProgress.failed > 0 && (
                <span className="text-github-danger">Failed: {starsCopyProgress.failed}</span>
              )}
            </div>
            <div className="w-full h-2 bg-github-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-github-accent transition-all duration-300"
                style={{ width: `${(starsCopyProgress.completed / starsCopyProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-github-muted text-sm mb-1">Following</p>
              <p className="text-4xl font-bold text-github-accent">{myFollowing.length}</p>
            </div>
            <div className="card text-center">
              <p className="text-github-muted text-sm mb-1">Followers</p>
              <p className="text-4xl font-bold text-github-accent">{myFollowers.length}</p>
            </div>
            <div className="card text-center">
              <p className="text-github-muted text-sm mb-1">Starred Repos</p>
              <p className="text-4xl font-bold text-github-accent">{myStars.length}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <FeatureBox
              icon={Info}
              title="Network Summary"
              description={`You have ${usersNotFollowedBack.length} follower${usersNotFollowedBack.length !== 1 ? 's' : ''} you're not following back, and ${usersNotFollowingBack.length} user${usersNotFollowingBack.length !== 1 ? 's' : ''} you follow who don't follow you back.`}
              variant="info"
            />
          </div>
        </div>
      )}

      {activeTab === 'followers' && (
        <div className="space-y-6">
          {/* Follow Back Feature Box */}
          <div className="card">
            <FeatureBox
              icon={Users}
              title="Follow Back Your Followers"
              description={usersNotFollowedBack.length > 0 
                ? `You have ${usersNotFollowedBack.length} follower${usersNotFollowedBack.length === 1 ? '' : 's'} that you're not following back. Click below to follow them all at once.`
                : "You're following all your followers. Great job maintaining your network!"
              }
              variant={usersNotFollowedBack.length > 0 ? 'action' : 'success'}
            >
              <button 
                onClick={handleFollowBackAll}
                disabled={networkCopyProgress.inProgress || usersNotFollowedBack.length === 0}
                className="btn-primary"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Follow Back All ({usersNotFollowedBack.length})
              </button>
            </FeatureBox>
          </div>

          {/* Followers List */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Your Followers</h3>
            {renderUserList(myFollowers, 'following')}
          </div>
        </div>
      )}

      {activeTab === 'following' && (
        <div className="space-y-6">
          {/* Following List */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">People You Follow ({myFollowing.length})</h3>
            {renderUserList(myFollowing, 'follows-back')}
          </div>

          {/* Copy Network Feature */}
          <div className="card">
            <FeatureBox
              icon={Sparkles}
              title="Copy Someone's Network"
              description="Search for a GitHub user to see who they follow. You can then selectively follow the same people to discover interesting developers and projects."
              variant="action"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter GitHub username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="input flex-1"
                />
                <button onClick={handleSearch} disabled={isLoading || !searchUsername} className="btn-primary">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 inline mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </FeatureBox>
          </div>
        </div>
      )}

      {activeTab === 'stars' && (
        <div className="space-y-6">
          {/* Copy Stars Feature */}
          <div className="card">
            <FeatureBox
              icon={Sparkles}
              title="Copy Someone's Stars"
              description="Search for a GitHub user to see their starred repositories. Discover interesting projects that other developers find valuable."
              variant="action"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter GitHub username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="input flex-1"
                />
                <button onClick={handleSearch} disabled={isLoading || !searchUsername} className="btn-primary">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 inline mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </FeatureBox>
          </div>

          {/* My Stars List */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Your Starred Repositories ({myStars.length})</h3>
            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-github-border bg-github-dark/50">
              {myStars.length === 0 ? (
                <p className="text-github-muted p-4 text-center">No starred repositories yet.</p>
              ) : (
                <div className="divide-y divide-github-border">
                  {myStars.map((star) => (
                    <div key={star.repo.id} className="flex justify-between items-center p-3 hover:bg-github-dimmed/50 transition-colors">
                      <a 
                        href={star.repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link truncate mr-3 flex-1"
                        title={star.repo.full_name}
                      >
                        {star.repo.full_name}
                      </a>
                      <span className="text-xs text-github-muted whitespace-nowrap flex items-center gap-1">
                        <Star className="w-3 h-3" /> {star.repo.stargazers_count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target User Network Results */}
      {targetUsername && !isNetworkLoading && activeTab === 'overview' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{targetUsername}'s Network</h2>
              <div className="flex bg-github-dark rounded-lg p-1">
                <button
                  onClick={() => {
                    setTargetTab('following');
                    setSelectedUsers(new Set());
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
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
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
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
                className="btn-secondary text-sm"
                disabled={(targetTab === 'following' ? targetUserFollowing : targetUserFollowers).length === 0}
              >
                {selectedUsers.size === (targetTab === 'following' ? targetUserFollowing : targetUserFollowers).filter(u => !myFollowingLogins.has(u.login)).length && selectedUsers.size > 0
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>
              <button
                onClick={handleCopyNetwork}
                disabled={selectedUsers.size === 0 || networkCopyProgress.inProgress}
                className="btn-primary text-sm"
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                Follow ({selectedUsers.size})
              </button>
              <button onClick={clearNetworkTarget} className="btn-secondary text-sm">
                Clear
              </button>
            </div>
          </div>

          {(targetTab === 'following' ? targetUserFollowing : targetUserFollowers).length === 0 ? (
            <div className="text-center py-12 text-github-muted border border-github-border rounded-lg bg-github-dark/30">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">This user {targetTab === 'following' ? 'is not following anyone' : 'has no followers'}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-1">
              {(targetTab === 'following' ? targetUserFollowing : targetUserFollowers).map((user) => {
                const isAlreadyFollowing = myFollowingLogins.has(user.login);
                const isSelected = selectedUsers.has(user.login);

                return (
                  <div
                    key={user.id}
                    onClick={() => !isAlreadyFollowing && handleSelectUser(user.login)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-github-accent/10 border-github-accent'
                        : isAlreadyFollowing
                        ? 'bg-github-dimmed/30 border-github-border cursor-not-allowed opacity-60'
                        : 'border-github-border hover:bg-github-dimmed/50 hover:border-github-muted'
                    }`}
                  >
                    <img src={user.avatar_url} alt={user.login} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link font-semibold truncate block text-sm"
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

      {/* Target User Stars Results */}
      {starsTargetUsername && !isStarsLoading && activeTab === 'stars' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">
              {starsTargetUsername}'s Stars ({targetUserStars.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllRepos}
                className="btn-secondary text-sm"
                disabled={targetUserStars.length === 0}
              >
                {selectedRepos.size === targetUserStars.filter(s => !myStarredRepoNames.has(s.repo.full_name)).length && selectedRepos.size > 0
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>
              <button
                onClick={handleCopyStars}
                disabled={selectedRepos.size === 0 || starsCopyProgress.inProgress}
                className="btn-primary text-sm"
              >
                <Star className="w-4 h-4 inline mr-1" />
                Copy ({selectedRepos.size})
              </button>
              <button onClick={clearStarsTarget} className="btn-secondary text-sm">
                Clear
              </button>
            </div>
          </div>

          {targetUserStars.length === 0 ? (
            <div className="text-center py-12 text-github-muted border border-github-border rounded-lg bg-github-dark/30">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">This user hasn't starred any repositories yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {targetUserStars.map((star) => {
                const repo = star.repo;
                const isAlreadyStarred = myStarredRepoNames.has(repo.full_name);
                const isSelected = selectedRepos.has(repo.full_name);

                return (
                  <div
                    key={repo.id}
                    onClick={() => !isAlreadyStarred && handleSelectRepo(repo.full_name)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-github-accent/10 border-github-accent'
                        : isAlreadyStarred
                        ? 'bg-github-dimmed/30 border-github-border cursor-not-allowed opacity-60'
                        : 'border-github-border hover:bg-github-dimmed/50 hover:border-github-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {repo.full_name}
                          </a>
                          {isAlreadyStarred && (
                            <span className="text-xs bg-github-success/20 text-github-success px-2 py-0.5 rounded">
                              Already Starred
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-github-muted text-sm mt-1 line-clamp-2">{repo.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-github-muted">
                          {repo.language && <span className="bg-github-dimmed px-2 py-0.5 rounded">{repo.language}</span>}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" /> {repo.stargazers_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
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
