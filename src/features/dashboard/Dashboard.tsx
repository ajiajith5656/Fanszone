import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import { authService } from "../../services/auth.service";
import "../../styles/dashboard.css";

type DashboardProps = {
  onSignOut: () => void;
  initialTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
};

export type NavTab = "profile" | "connections" | "feed" | "room";

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
      await apiService.getUserProfile();
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    authService.signOut();
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
        {activeTab === "profile" && <ProfileView signupData={signupData} />}
        {activeTab === "room" && <RoomView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("profile");
            onTabChange?.("profile");
          }}
          aria-label="Profile"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>

        <button
          className={`nav-item ${activeTab === "connections" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("connections");
            onTabChange?.("connections");
          }}
          aria-label="Connections"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Connections</span>
        </button>

        <button
          className={`nav-item ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("feed");
            onTabChange?.("feed");
          }}
          aria-label="Feed"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <span>Feed</span>
        </button>

        <button
          className={`nav-item ${activeTab === "room" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("room");
            onTabChange?.("room");
          }}
          aria-label="Room"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>Room</span>
        </button>
      </nav>
    </div>
  );
}

// Feed View Component
function FeedView({ signupData: _signupData }: { signupData: any }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await apiService.getRecommendations();
      setMatches(response.data || []);
    } catch (err) {
      console.error("Failed to load matches", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'like' | 'pass' | 'super_like') => {
    if (matches.length === 0) return;
    
    try {
      // Call API to record action
      // await apiService.recordSwipe(matches[0].id, action);
      console.log('User action:', action, 'on profile:', matches[0]);
      
      // Remove current match and show next
      setMatches(prev => prev.slice(1));
    } catch (err) {
      console.error("Failed to record action", err);
    }
  };

  return (
    <div className="feed-view">
      <div className="feed-header">
        <h2>Discover</h2>
        <p className="feed-subtitle">Find your perfect match</p>
      </div>
      
      {loading ? (
        <div className="feed-loading">
          <p>Loading matches...</p>
        </div>
      ) : matches.length > 0 ? (
        <>
          <div className="profile-cards">
            <div className="profile-stack-card">
              <div className="card-image">
                {matches[0].images?.[0] ? (
                  <img
                    src={matches[0].images[0]}
                    alt={matches[0].name}
                  />
                ) : (
                  <div className="card-placeholder">No image</div>
                )}
              </div>
              <div className="card-info">
                <h3>{matches[0].name}, {matches[0].age}</h3>
                <p>{matches[0].distance && `${matches[0].distance} km away`} {matches[0].isOnline && '• Active now'}</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn reject" onClick={() => handleAction('pass')} aria-label="Pass">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button className="action-btn like" onClick={() => handleAction('like')} aria-label="Like">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button className="action-btn super-like" onClick={() => handleAction('super_like')} aria-label="Super Like">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No more profiles to show</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Check back later for new matches!</p>
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
      const response = await apiService.getMatches();
      setConnections(response.data || []);
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
        <p className="section-subtitle">Your matches and conversations</p>
      </div>
      
      {loading ? (
        <div className="feed-loading">
          <p>Loading connections...</p>
        </div>
      ) : connections.length > 0 ? (
        <div className="connections-list">
          {connections.map((connection: any) => (
            <div key={connection.id} className="connection-item">
              <div className="connection-avatar">
                {connection.image ? (
                  <img src={connection.image} alt={connection.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <div className="avatar-placeholder">
                    {connection.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {connection.isOnline && <span className="online-indicator"></span>}
              </div>
              <div className="connection-info">
                <h4>{connection.name}</h4>
                <p>{connection.lastMessage || 'New match!'}</p>
              </div>
              <span className="connection-time">{connection.timestamp || ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No connections yet</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Start swiping to make connections!</p>
        </div>
      )}
    </div>
  );
}

// Profile View Component
function ProfileView({ signupData }: { signupData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: signupData.name || "",
    dateOfBirth: signupData.dateOfBirth || "",
    gender: signupData.gender || "",
    email: signupData.email || "",
    lookingFor: signupData.lookingFor || "",
    relationshipType: signupData.relationshipType || "",
    interests: signupData.interests || [],
    bio: signupData.bio || "",
    location: signupData.location || "",
  });
  const [verificationStatus] = useState<string>("pending");

  const handleSave = async () => {
    try {
      await apiService.updateUserProfile(profile);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handleVerifyNow = () => {
    // Navigate to verification or trigger verification modal
    console.log("Verify now clicked");
  };

  const interestOptions = [
    "Travel", "Music", "Movies", "Sports", "Reading", "Gaming",
    "Cooking", "Photography", "Art", "Fitness", "Dancing", "Pets"
  ];

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="profile-view">
      <div className="section-header">
        <h2>My Profile</h2>
        <button 
          className="edit-toggle-btn"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      
      <div className="profile-content">
        {/* Profile Images */}
        <div className="profile-images-grid">
          {signupData.images?.[0] ? (
            <div className="profile-image-item main">
              <img src={URL.createObjectURL(signupData.images[0])} alt="Profile" />
              {isEditing && <div className="image-overlay">Change</div>}
            </div>
          ) : (
            <div className="profile-image-item main placeholder">
              <span>Add Photo</span>
            </div>
          )}
          {[1, 2].map((index) => (
            <div key={index} className="profile-image-item placeholder">
              {signupData.images?.[index] ? (
                <>
                  <img src={URL.createObjectURL(signupData.images[index])} alt={`Photo ${index + 1}`} />
                  {isEditing && <div className="image-overlay">Change</div>}
                </>
              ) : (
                <span>+</span>
              )}
            </div>
          ))}
        </div>

        {/* Verification Status */}
        <div className={`verification-banner ${verificationStatus}`}>
          <div className="verification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <span className="verification-label">Verification Status</span>
              <span className="verification-status-text">
                {verificationStatus === "approved" ? "Verified" : 
                 verificationStatus === "pending" ? "Pending Review" : "Not Verified"}
              </span>
            </div>
          </div>
          {verificationStatus !== "approved" && (
            <button className="verify-now-btn" onClick={handleVerifyNow}>
              Verify Now
            </button>
          )}
        </div>

        {/* Profile Details Form */}
        <div className="profile-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-field">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="profile-input"
                />
              ) : (
                <div className="profile-value">{profile.name || "Not provided"}</div>
              )}
            </div>

            <div className="form-field">
              <label>Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="profile-input"
                />
              ) : (
                <div className="profile-value">
                  {profile.dateOfBirth 
                    ? `${new Date(profile.dateOfBirth).toLocaleDateString()} (Age: ${calculateAge(profile.dateOfBirth)})`
                    : "Not provided"}
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Gender</label>
              {isEditing ? (
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="profile-input"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="profile-value">{profile.gender || "Not specified"}</div>
              )}
            </div>

            <div className="form-field">
              <label>Email</label>
              <div className="profile-value">{profile.email || "Not provided"}</div>
              <span className="field-note">Email cannot be changed</span>
            </div>

            <div className="form-field">
              <label>Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="profile-input"
                  placeholder="City, Country"
                />
              ) : (
                <div className="profile-value">{profile.location || "Not specified"}</div>
              )}
            </div>
          </div>

          {/* About Me */}
          <div className="form-section">
            <h3 className="section-title">About Me</h3>
            
            <div className="form-field">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="profile-textarea"
                  placeholder="Tell others about yourself..."
                  rows={4}
                />
              ) : (
                <div className="profile-value">{profile.bio || "No bio added yet"}</div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="form-section">
            <h3 className="section-title">Dating Preferences</h3>
            
            <div className="form-field">
              <label>Looking For</label>
              {isEditing ? (
                <select
                  value={profile.lookingFor}
                  onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
                  className="profile-input"
                >
                  <option value="">Select preference</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Everyone">Everyone</option>
                </select>
              ) : (
                <div className="profile-value">{profile.lookingFor || "Not specified"}</div>
              )}
            </div>

            <div className="form-field">
              <label>Relationship Type</label>
              {isEditing ? (
                <select
                  value={profile.relationshipType}
                  onChange={(e) => setProfile({ ...profile, relationshipType: e.target.value })}
                  className="profile-input"
                >
                  <option value="">Select type</option>
                  <option value="Long-term">Long-term</option>
                  <option value="Short-term">Short-term</option>
                  <option value="Friendship">Friendship</option>
                  <option value="Casual">Casual</option>
                </select>
              ) : (
                <div className="profile-value">{profile.relationshipType || "Not specified"}</div>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="form-section">
            <h3 className="section-title">Interests</h3>
            <div className="interests-grid">
              {isEditing ? (
                interestOptions.map((interest) => (
                  <button
                    key={interest}
                    className={`interest-chip ${profile.interests.includes(interest) ? "selected" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))
              ) : (
                profile.interests.length > 0 ? (
                  profile.interests.map((interest: string) => (
                    <span key={interest} className="interest-tag">{interest}</span>
                  ))
                ) : (
                  <div className="profile-value">No interests added</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Room View Component
function RoomView() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      // API endpoint to be implemented
      // const response = await apiService.getRooms();
      // setRooms(response.data || []);
      setRooms([]);
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-view">
      <div className="section-header">
        <h2>Chat Rooms</h2>
        <p className="section-subtitle">Join conversations and meet new people</p>
      </div>
      
      {loading ? (
        <div className="feed-loading">
          <p>Loading rooms...</p>
        </div>
      ) : rooms.length > 0 ? (
        <div className="rooms-list">
          {rooms.map((room: any) => (
            <div key={room.id} className="room-card">
              <div className="room-icon">{room.icon || '💬'}</div>
              <h4>{room.name}</h4>
              <p>{room.membersOnline || 0} members online</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No chat rooms available</p>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>Check back soon for group conversations!</p>
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
