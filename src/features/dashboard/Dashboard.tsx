import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";
import "../../styles/feed.css";

type DashboardProps = {
  onSignOut: () => void;
  initialTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
};

export type NavTab = "feed" | "connections" | "search" | "profile";

export default function Dashboard({ onSignOut, initialTab, onTabChange }: DashboardProps) {
  const { signupData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab || "feed");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, activeTab]);

  const loadProfile = async () => {
    try {
      // Mock load - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Mock sign out - UI only
    onSignOut();
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <button className="header-icon-btn" onClick={handleSignOut} aria-label="Sign out">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
        
        <h1 className="dashboard-logo">MC</h1>
        
        <button className="header-icon-btn" aria-label="Messages">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === "feed" && <FeedView signupData={signupData} />}
        {activeTab === "connections" && <ConnectionsView />}
        {activeTab === "search" && <SearchView />}
        {activeTab === "profile" && <ProfileView signupData={signupData} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("feed");
            onTabChange?.("feed");
          }}
          aria-label="Feed"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Feed</span>
        </button>

        <button
          className={`nav-item ${activeTab === "connections" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("connections");
            onTabChange?.("connections");
          }}
          aria-label="Connections"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Connections</span>
        </button>

        <button
          className="nav-item-center"
          onClick={() => window.location.href = '/post/create'}
          aria-label="Create Post"
        >
          <div className="add-post-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === "search" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("search");
            onTabChange?.("search");
          }}
          aria-label="Search"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Search</span>
        </button>

        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("profile");
            onTabChange?.("profile");
          }}
          aria-label="Profile"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

// Feed View Component
function FeedView({ signupData: _signupData }: { signupData: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      // Mock posts - UI only
      const mockPosts = [
        {
          postId: "1",
          authorName: "Sample Author",
          title: "Sample Post",
          description: "This is a sample post for UI testing",
          isPremium: false,
          price: 0,
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          hasAccess: true,
          createdAt: new Date().toISOString()
        }
      ];
      setPosts(prev => page === 1 ? mockPosts : [...prev, ...mockPosts]);
      setHasMore(false);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPage(1);
      loadPosts();
      return;
    }
    
    setIsSearching(true);
    try {
      // Mock search - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts([]);
      setHasMore(false);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      // Mock like - UI only
      await new Promise(resolve => setTimeout(resolve, 200));
      setPosts(prev => prev.map(post => 
        post.postId === postId 
          ? { ...post, isLiked: !isLiked, likeCount: post.likeCount + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handlePurchase = async (postId: string) => {
    try {
      // Mock purchase - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts(prev => prev.map(post => 
        post.postId === postId ? { ...post, hasAccess: true } : post
      ));
    } catch (err) {
      console.error("Failed to purchase post", err);
      alert("Failed to purchase post");
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="feed-view" onScroll={handleScroll}>
      {/* Search Bar */}
      <div className="feed-search">
        <input 
          type="text"
          placeholder="Search by author name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button 
          className="search-btn" 
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <div className="spinner-small"></div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          )}
        </button>
      </div>

      {/* Posts Feed */}
      {loading && page === 1 ? (
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="posts-container">
          {posts.map((post: any) => (
            <PostCard 
              key={post.postId} 
              post={post} 
              onLike={handleLike}
              onPurchase={handlePurchase}
            />
          ))}
          {loading && <div className="loading-more">Loading more...</div>}
        </div>
      ) : (
        <div className="empty-state">
          <p>No posts yet</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Check back later for new content!</p>
        </div>
      )}
    </div>
  );
}

// Post Card Component
function PostCard({ post, onLike, onPurchase }: { post: any; onLike: (postId: string, isLiked: boolean) => void; onPurchase: (postId: string) => void }) {
  const isPaid = post.accessType === 'paid' && !post.hasAccess;

  return (
    <div className="post-card">
      {/* User Info */}
      <div className="post-header">
        <div className="post-user-info">
          <div className="post-avatar">
            <img src={post.authorAvatar} alt={post.authorName} />
          </div>
          <div className="post-user-details">
            <div className="post-author-name">
              {post.authorName}
              {post.isVerified && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#4CAF50" className="verified-icon">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              )}
            </div>
            <div className="post-meta">
              <span className="post-timestamp">{formatTimestamp(post.createdAt)}</span>
              {post.mood && <span className="post-mood">• {post.mood}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      {post.mediaType === 'image' && (
        <div className={`post-media ${isPaid ? 'blurred' : ''}`}>
          <img src={post.mediaUrl} alt="Post" className="post-image" />
          {isPaid && (
            <div className="paid-overlay">
              <button className="pay-button" onClick={() => onPurchase(post.postId)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay ${post.price} to Watch
              </button>
            </div>
          )}
        </div>
      )}

      {post.mediaType === 'video' && (
        <div className={`post-media ${isPaid ? 'blurred' : ''}`}>
          <video controls className="post-video" src={post.mediaUrl}></video>
          {isPaid && (
            <div className="paid-overlay">
              <button className="pay-button" onClick={() => onPurchase(post.postId)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay ${post.price} to Watch
              </button>
            </div>
          )}
        </div>
      )}

      {post.description && (
        <div className="post-description">{post.description}</div>
      )}

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.postId, post.isLiked)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{post.likeCount || 0}</span>
        </button>
        <button 
          className="post-action-btn"
          onClick={() => window.location.href = `/post/${post.postId}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{post.commentCount || 0}</span>
        </button>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Connections View Component
function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'people' | 'posts'>('people');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Mock search - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setResults([]);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-view">
      <div className="section-header">
        <h2>Search</h2>
        <p className="section-subtitle">Find people and content</p>
      </div>

      {/* Search Type Toggle */}
      <div className="search-type-toggle\">
        <button
          className={searchType === 'people' ? 'active' : ''}
          onClick={() => setSearchType('people')}
        >
          People
        </button>
        <button
          className={searchType === 'posts' ? 'active' : ''}
          onClick={() => setSearchType('posts')}
        >
          Posts
        </button>
      </div>

      {/* Search Input */}
      <div className="feed-search">
        <input 
          type="text"
          placeholder={`Search ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button 
          className="search-btn" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <div className="spinner-small"></div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          )}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="feed-loading">
          <p>Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="search-results">
          {results.map((result: any) => (
            <div key={result.id} className="result-item">
              <p>{result.name}</p>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="empty-state">
          <p>No results found</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Try a different search term</p>
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <p style={{ marginTop: '16px' }}>Start searching</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Find people and posts you're interested in</p>
        </div>
      )}
    </div>
  );
}

// Connections View Component
function ConnectionsView() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      // Mock connections - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setConnections([]);
    } catch (err) {
      console.error("Failed to load connections", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connections-view">
      <div className="section-header">
        <h2>Connections</h2>
        <p className="section-subtitle">People you've connected with</p>
      </div>
      
      {loading ? (
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading connections...</p>
        </div>
      ) : connections.length > 0 ? (
        <div className="connections-list">
          {connections.map((connection: any) => (
            <div key={connection.id} className="connection-item">
              <div className="connection-avatar">
                <div className="avatar-placeholder">
                  {connection.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="connection-info">
                <h4>{connection.name}</h4>
                <p>{connection.status}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p style={{ marginTop: '16px' }}>No connections yet</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Start connecting with people!</p>
        </div>
      )}
    </div>
  );
}

// Profile View Component
function ProfileView({ signupData }: { signupData: any }) {
  const [profile, setProfile] = useState({
    name: signupData.name || "",
    dateOfBirth: signupData.dateOfBirth || "",
    gender: signupData.gender || "",
    email: signupData.email || "",
    lookingFor: signupData.lookingFor || "",
    relationshipType: signupData.relationshipType || "",
    orientation: signupData.orientation || "",
    interests: signupData.interests || [],
    bio: signupData.bio || "",
    location: signupData.location || "",
    profession: signupData.profession || "",
    maritalStatus: signupData.maritalStatus || "",
    images: signupData.images || []
  });
  
  const [verificationStatus] = useState<string>("pending"); // "pending", "approved", "rejected"
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSetProfileConfirm, setShowSetProfileConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [imageToSetAsProfile, setImageToSetAsProfile] = useState<number | null>(null);

  // Dropdown data - these would come from backend
  const locationOptions = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"];
  const lookingForOptions = ["Men", "Women", "Everyone"];
  const relationshipTypeOptions = ["Long-term", "Short-term", "Friendship", "Casual", "Marriage"];
  const orientationOptions = ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Asexual", "Other"];
  const maritalStatusOptions = ["Single", "Divorced", "Widowed", "Separated"];

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? profile.images.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === profile.images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleDeleteImage = (index: number) => {
    setImageToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteImage = () => {
    if (imageToDelete !== null && profile.images.length > 3) {
      const newImages = profile.images.filter((_: any, i: number) => i !== imageToDelete);
      setProfile({ ...profile, images: newImages });
      setCurrentImageIndex(0);
    }
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  };

  const handleSetAsProfileImage = (index: number) => {
    setImageToSetAsProfile(index);
    setShowSetProfileConfirm(true);
  };

  const confirmSetAsProfileImage = () => {
    if (imageToSetAsProfile !== null) {
      const newImages = [...profile.images];
      const [selectedImage] = newImages.splice(imageToSetAsProfile, 1);
      newImages.unshift(selectedImage);
      setProfile({ ...profile, images: newImages });
      setCurrentImageIndex(0);
    }
    setShowSetProfileConfirm(false);
    setImageToSetAsProfile(null);
  };

  const handleAddImages = () => {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files);
      if (profile.images.length + files.length <= 10) {
        setProfile({ ...profile, images: [...profile.images, ...files] });
      } else {
        alert('Maximum 10 images allowed');
      }
    };
    input.click();
  };

  const handleVerifyNow = () => {
    console.log("Navigate to verification");
    // Navigate to verification page
  };

  const handleExclusiveGallery = () => {
    console.log("Navigate to exclusive gallery");
    // Navigate to exclusive gallery page
  };

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    try {
      // Mock sign out - UI only
      window.location.reload();
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 350) {
      setProfile({ ...profile, bio: value });
    }
  };

  const isVerified = verificationStatus === "approved";
  const canChangeLocation = !isVerified;

  return (
    <div className="profile-view">
      {/* Image Carousel Section */}
      <div className="profile-images-section">
        {profile.images.length > 0 ? (
          <div className="image-carousel">
            <div className="carousel-main">
              <img 
                src={typeof profile.images[currentImageIndex] === 'string' 
                  ? profile.images[currentImageIndex] 
                  : URL.createObjectURL(profile.images[currentImageIndex])} 
                alt={`Profile ${currentImageIndex + 1}`}
                className="carousel-image"
              />
              
              {/* Delete Icon */}
              <button 
                className="carousel-delete-btn"
                onClick={() => handleDeleteImage(currentImageIndex)}
                disabled={profile.images.length <= 3}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>

              {/* Navigation Arrows */}
              {profile.images.length > 1 && (
                <>
                  <button className="carousel-nav prev" onClick={() => handleImageNavigation('prev')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button className="carousel-nav next" onClick={() => handleImageNavigation('next')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="image-counter">
                {currentImageIndex + 1} / {profile.images.length}
              </div>
            </div>

            {/* Set as Profile Button */}
            {currentImageIndex !== 0 && (
              <button 
                className="set-profile-btn"
                onClick={() => handleSetAsProfileImage(currentImageIndex)}
              >
                Set as Profile Image
              </button>
            )}

            {/* Add More Images */}
            {profile.images.length < 10 && (
              <button className="add-images-btn" onClick={handleAddImages}>
                + Add More Images ({profile.images.length}/10)
              </button>
            )}
          </div>
        ) : (
          <div className="no-images">
            <p>No images uploaded</p>
            <button className="add-images-btn" onClick={handleAddImages}>
              + Add Images (Min 3, Max 10)
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        {/* Name and Verification */}
        <div className="profile-name-section">
          <h2 className="profile-name">{profile.name}</h2>
          {isVerified ? (
            <div className="verified-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span>Verified</span>
            </div>
          ) : (
            <button className="verify-small-btn" onClick={handleVerifyNow}>
              Verify Account
            </button>
          )}
        </div>

        {/* Exclusive Gallery Button */}
        <button className="exclusive-gallery-btn" onClick={handleExclusiveGallery}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          My Exclusive Gallery
        </button>

        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-field readonly">
            <label>Date of Birth</label>
            <div className="profile-value">
              {profile.dateOfBirth 
                ? `${new Date(profile.dateOfBirth).toLocaleDateString()} (Age: ${calculateAge(profile.dateOfBirth)})`
                : "Not provided"}
            </div>
          </div>

          <div className="form-field readonly">
            <label>Gender</label>
            <div className="profile-value">{profile.gender || "Not specified"}</div>
          </div>

          <div className="form-field readonly">
            <label>Email</label>
            <div className="profile-value">{profile.email || "Not provided"}</div>
          </div>

          <div className="form-field">
            <label>Location</label>
            {canChangeLocation ? (
              <select
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="profile-input"
              >
                <option value="">Select location</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            ) : (
              <>
                <div className="profile-value">{profile.location || "Not specified"}</div>
                <span className="field-note">Location is locked after verification</span>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="form-section">
          <h3 className="section-title">About Me</h3>
          <div className="form-field">
            <label>Bio <span className="char-count">({profile.bio.length}/350)</span></label>
            <textarea
              value={profile.bio}
              onChange={handleBioChange}
              className="profile-textarea"
              placeholder="Tell others about yourself..."
              rows={4}
              maxLength={350}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="form-section">
          <h3 className="section-title">Preferences</h3>
          
          <div className="form-field">
            <label>Looking For</label>
            <select
              value={profile.lookingFor}
              onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
              className="profile-input"
            >
              <option value="">Select preference</option>
              {lookingForOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Relationship Type</label>
            <select
              value={profile.relationshipType}
              onChange={(e) => setProfile({ ...profile, relationshipType: e.target.value })}
              className="profile-input"
            >
              <option value="">Select type</option>
              {relationshipTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Orientation</label>
            <select
              value={profile.orientation}
              onChange={(e) => setProfile({ ...profile, orientation: e.target.value })}
              className="profile-input"
            >
              <option value="">Select orientation</option>
              {orientationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Info */}
        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          
          <div className="form-field">
            <label>Profession</label>
            <input
              type="text"
              value={profile.profession}
              onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
              className="profile-input"
              placeholder="Enter your profession"
            />
          </div>

          <div className="form-field">
            <label>Marital Status</label>
            <select
              value={profile.maritalStatus}
              onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
              className="profile-input"
            >
              <option value="">Select status</option>
              {maritalStatusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Links */}
        <div className="profile-footer">
          <a href="#help" className="footer-link">Help & Support</a>
          <a href="#terms" className="footer-link">Terms of Service</a>
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <button className="signout-btn" onClick={handleSignOut}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Delete Image?</h3>
            <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="confirm-btn delete" onClick={confirmDeleteImage}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSetProfileConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Set as Profile Image?</h3>
            <p>This image will be shown first to other users.</p>
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={() => setShowSetProfileConfirm(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmSetAsProfileImage}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSignOutConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Sign Out?</h3>
            <p>Are you sure you want to sign out of your account?</p>
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={() => setShowSignOutConfirm(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmSignOut}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Room View Component
function ReelsView() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      // Mock reels - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setReels([]);
    } catch (err) {
      console.error("Failed to load reels", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reels-view">
      <div className="section-header">
        <h2>Reels</h2>
        <p className="section-subtitle">Short video content from the community</p>
      </div>
      
      {loading ? (
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading reels...</p>
        </div>
      ) : reels.length > 0 ? (
        <div className="reels-grid">
          {reels.map((reel: any) => (
            <div key={reel.id} className="reel-card">
              <div className="reel-thumbnail">
                <img src={reel.thumbnail} alt={reel.title} />
                <div className="reel-play-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="reel-info">
                <p className="reel-author">{reel.author}</p>
                <p className="reel-views">{reel.views} views</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
          </svg>
          <p style={{ marginTop: '16px' }}>No reels yet</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Check back later for video content!</p>
        </div>
      )}
    </div>
  );
}

function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
