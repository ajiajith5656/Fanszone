import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/post-content.css';

export function PostContentPage() {
  const { postId } = useParams<{ postId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!postId;

  const [formData, setFormData] = useState({
    description: '',
    mediaFiles: [] as File[],
    mediaType: 'none' as 'image' | 'video' | 'none',
    accessType: 'free' as 'free' | 'paid',
    price: '',
    mood: ''
  });
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const moods = ['😊 Happy', '😍 Loved', '🔥 Excited', '😌 Relaxed', '😎 Cool', '🤔 Thoughtful', '😴 Tired', '🎉 Celebrating'];

  useEffect(() => {
    if (isEditMode) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      // Mock load post - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockPost = {
        description: 'Sample post description',
        mediaType: 'none',
        accessType: 'free',
        price: 0,
        mood: ''
      };
      setFormData({
        description: mockPost.description || '',
        mediaFiles: [],
        mediaType: mockPost.mediaType || 'none',
        accessType: mockPost.accessType || 'free',
        price: mockPost.price?.toString() || '',
        mood: mockPost.mood || ''
      });
    } catch (err) {
      console.error("Failed to load post", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'none';

    if (fileType === 'none') {
      alert('Please upload only images or videos');
      return;
    }

    setFormData(prev => ({
      ...prev,
      mediaFiles: [file],
      mediaType: fileType
    }));

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreviewUrls([previewUrl]);
  };

  const handleRemoveMedia = () => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: [],
      mediaType: 'none'
    }));
    mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setMediaPreviewUrls([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim() && formData.mediaFiles.length === 0) {
      alert('Please add content or media');
      return;
    }

    if (formData.description.length > 350) {
      alert('Description must be 350 characters or less');
      return;
    }

    if (formData.accessType === 'paid' && (!formData.price || parseFloat(formData.price) <= 0)) {
      alert('Please set a valid price for paid content');
      return;
    }

    setLoading(true);
    try {
      // Mock save post - UI only
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/feed');
    } catch (err) {
      console.error("Failed to save post", err);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setLoading(true);
    try {
      // Mock delete - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/feed');
    } catch (err) {
      console.error("Failed to delete post", err);
      alert('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="full-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit} className="post-form">
          {/* Media Upload */}
          <div className="form-section">
            <label className="section-label">Media (Optional)</label>
            <p className="section-hint">Supported sizes: 1050x1050px, 1050x1350px for images. Standard reels and YouTube sizes for videos.</p>
            
            {mediaPreviewUrls.length > 0 ? (
              <div className="media-preview">
                {formData.mediaType === 'image' && (
                  <img src={mediaPreviewUrls[0]} alt="Preview" className="preview-image" />
                )}
                {formData.mediaType === 'video' && (
                  <video src={mediaPreviewUrls[0]} controls className="preview-video"></video>
                )}
                <button type="button" className="remove-media-btn" onClick={handleRemoveMedia}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              <label className="media-upload-area">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  style={{ display: 'none' }}
                />
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>Click to upload image or video</p>
              </label>
            )}
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="section-label">
              Description <span className="char-count">({formData.description.length}/350)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 350) {
                  setFormData({ ...formData, description: e.target.value });
                }
              }}
              placeholder="What's on your mind?"
              className="post-textarea"
              rows={4}
              maxLength={350}
            />
          </div>

          {/* Mood */}
          <div className="form-section">
            <label className="section-label">Mood (Optional)</label>
            <div className="mood-selector">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`mood-btn ${formData.mood === mood ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, mood: formData.mood === mood ? '' : mood })}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Access Type */}
          <div className="form-section">
            <label className="section-label">Access Type</label>
            <div className="access-type-selector">
              <button
                type="button"
                className={`access-btn ${formData.accessType === 'free' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, accessType: 'free', price: '' })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                Free - Public
              </button>
              <button
                type="button"
                className={`access-btn ${formData.accessType === 'paid' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, accessType: 'paid' })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Paid - Public
              </button>
            </div>

            {formData.accessType === 'paid' && (
              <div className="price-input-wrapper">
                <label className="input-label">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price"
                  className="price-input"
                  min="0.01"
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Post' : 'Publish Post'}
            </button>
            {isEditMode && (
              <button type="button" className="delete-btn" onClick={handleDelete} disabled={loading}>
                Delete Post
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
