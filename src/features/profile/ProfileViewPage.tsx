import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../services/api.service";
import "../../styles/profile-view.css";

interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  profession: string;
  location: string;
  isVerified: boolean;
  images: string[];
  hasExclusiveRoom: boolean;
  isConnected: boolean;
}

export const ProfileViewPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.viewUserProfile(userId!);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await apiService.sendConnectionRequest(userId!);
      alert("Connection request sent!");
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request");
    }
  };

  const handleReject = () => {
    navigate(-1);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please select a reason");
      return;
    }
    try {
      await apiService.reportUser(userId!, reportReason, reportDescription);
      alert("Report submitted successfully");
      setShowReportDialog(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error reporting user:", error);
      alert("Failed to submit report");
    }
  };

  const handleEnterExclusiveRoom = () => {
    navigate(`/exclusive-room/${userId}`);
  };

  const nextImage = () => {
    if (profile && profile.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % profile.images.length);
    }
  };

  const prevImage = () => {
    if (profile && profile.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + profile.images.length) % profile.images.length
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-view-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-view-page">
        <div className="error-container">
          <p>Profile not found</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="profile-view-container">
        {/* Image Carousel */}
        <div className="profile-images-section">
          {profile.images.length > 0 ? (
            <>
              <div className="main-image">
                <img src={profile.images[currentImageIndex]} alt={profile.name} />
                {profile.images.length > 1 && (
                  <>
                    <button className="nav-btn prev-btn" onClick={prevImage}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button className="nav-btn next-btn" onClick={nextImage}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="image-dots">
                {profile.images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImageIndex ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-images">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="profile-header">
            <h1 className="profile-name">
              {profile.name}
              {profile.isVerified && (
                <svg className="verified-badge" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </h1>
            <div className="profile-meta">
              <span className="meta-item">{profile.age} years old</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{profile.gender}</span>
            </div>
          </div>

          {profile.bio && (
            <div className="profile-section">
              <h3>About</h3>
              <p className="profile-bio">{profile.bio}</p>
            </div>
          )}

          <div className="profile-details">
            {profile.profession && (
              <div className="detail-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
                <span>{profile.profession}</span>
              </div>
            )}
            {profile.location && (
              <div className="detail-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {!profile.isConnected ? (
            <>
              <button className="action-btn connect-btn" onClick={handleConnect}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Connect
              </button>
              <button className="action-btn reject-btn" onClick={handleReject}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Reject
              </button>
            </>
          ) : (
            <button className="action-btn connected-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Connected
            </button>
          )}
          <button className="action-btn report-btn" onClick={() => setShowReportDialog(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Report
          </button>
        </div>

        {/* Exclusive Room Button */}
        {profile.hasExclusiveRoom && (
          <button className="exclusive-room-btn" onClick={handleEnterExclusiveRoom}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Enter Exclusive Room
          </button>
        )}
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="modal-overlay" onClick={() => setShowReportDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Report User</h2>
            <div className="form-group">
              <label>Reason *</label>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="">Select a reason</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="scam">Scam</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Additional Details (Optional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more details..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReportDialog(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleReport}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
