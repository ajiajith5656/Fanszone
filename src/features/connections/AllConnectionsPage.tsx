import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/connections-pages.css';

export function AllConnectionsPage() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadConnections();
  }, [page]);

  const loadConnections = async () => {
    try {
      // Mock connections - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setConnections([]);
      setHasMore(false);
    } catch (err) {
      console.error("Failed to load connections", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Mock search - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setConnections([]);
      setHasMore(false);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReport = (userId: string) => {
    console.log("Report user:", userId);
  };

  return (
    <div className="full-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>My Connections</h1>
      </div>

      <div className="page-content">
        {/* Search Box */}
        <div className="search-box">
          <input 
            type="text"
            placeholder="Search by name..."
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

        {/* Connection Cards */}
        {loading && page === 1 ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading connections...</p>
          </div>
        ) : connections.length > 0 ? (
          <>
            <div className="connection-cards">
              {connections.map((connection: any) => (
                <div key={connection.userId} className="connection-card">
                  <div className="card-image">
                    <img src={connection.profileImage} alt={connection.name} />
                  </div>
                  <div className="card-content">
                    <div className="card-header">
                      <h4 className="card-name">{connection.name}</h4>
                      {connection.isVerified && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50" className="verified-icon">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      )}
                    </div>
                    <div className="card-actions">
                      <button className="action-btn-small view">View</button>
                      <button className="action-btn-small message">Message</button>
                      <button className="action-btn-small report" onClick={() => handleReport(connection.userId)}>Report</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <button 
                className="load-more-btn" 
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No connections found</p>
          </div>
        )}
      </div>
    </div>
  );
}
