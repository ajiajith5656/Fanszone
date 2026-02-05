import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import '../../styles/post-view.css';

export function PostViewPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await apiService.getPostById(postId!);
      setPost(response.data);
    } catch (err) {
      console.error("Failed to load post", err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await apiService.getComments(postId!);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      if (post.isLiked) {
        await apiService.unlikePost(postId!);
      } else {
        await apiService.likePost(postId!);
      }
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likeCount: post.likeCount + (post.isLiked ? -1 : 1)
      });
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      await apiService.addComment(postId!, newComment);
      setNewComment('');
      loadComments();
      setPost({ ...post, commentCount: (post.commentCount || 0) + 1 });
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await apiService.deleteComment(postId!, commentId);
      setComments(comments.filter(c => c.commentId !== commentId));
      setPost({ ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) });
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handlePurchase = async () => {
    try {
      await apiService.purchasePost(postId!);
      setPost({ ...post, hasAccess: true });
    } catch (err) {
      console.error("Failed to purchase post", err);
      alert("Failed to purchase post");
    }
  };

  const handleReport = () => {
    navigate('/report-abuse');
  };

  if (loading) {
    return (
      <div className="full-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="full-page">
        <div className="empty-state">
          <p>Post not found</p>
        </div>
      </div>
    );
  }

  const isPaid = post.accessType === 'paid' && !post.hasAccess;

  return (
    <div className="full-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>Post</h1>
      </div>

      <div className="page-content post-view-content">
        {/* Post */}
        <div className="post-card large">
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
                  <button className="pay-button" onClick={handlePurchase}>
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
                  <button className="pay-button" onClick={handlePurchase}>
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

          {/* Interaction Stats */}
          <div className="post-stats">
            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{post.likeCount || 0} likes</span>
            </div>
            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{post.commentCount || 0} comments</span>
            </div>
          </div>

          {/* Description */}
          {post.description && (
            <div className="post-description-full">
              <strong>{post.authorName}</strong> {post.description}
            </div>
          )}

          {/* Actions */}
          <div className="post-actions-large">
            <button 
              className={`action-btn-large ${post.isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {post.isLiked ? 'Liked' : 'Like'}
            </button>
            <button className="action-btn-large" onClick={handleReport}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Report
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3 className="comments-title">Comments</h3>
          
          {/* Add Comment */}
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows={2}
            />
            <button 
              className="comment-submit-btn" 
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment: any) => (
                <div key={comment.commentId} className="comment-item">
                  <div className="comment-avatar">
                    <img src={comment.userAvatar} alt={comment.userName} />
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>{comment.userName}</strong>
                      {comment.isVerified && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#4CAF50">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      )}
                      <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                  {(comment.userId === userEmail || post.authorId === userEmail) && (
                    <button 
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.commentId)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          )}
        </div>
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
