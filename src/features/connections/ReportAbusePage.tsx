import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/connections-pages.css';

export function ReportAbusePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    reason: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    'Inappropriate Content',
    'Harassment',
    'Fake Profile',
    'Spam',
    'Underage User',
    'Scam or Fraud',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason || !formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // Mock report - UI only
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Failed to submit report", err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="full-page">
        <div className="page-header">
          <h1>Report Abuse</h1>
        </div>
        <div className="page-content">
          <div className="success-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h2>Report Submitted</h2>
            <p>Thank you for helping keep our community safe. We'll review your report shortly.</p>
          </div>
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
        <h1>Report Abuse</h1>
      </div>

      <div className="page-content">
        <div className="report-form-container">
          <p className="report-intro">
            Help us maintain a safe and respectful community. Your report will be reviewed by our team.
          </p>

          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-field">
              <label>User ID (optional)</label>
              <input 
                type="text"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="Enter user ID if known"
                className="profile-input"
              />
            </div>

            <div className="form-field">
              <label>Reason for Report *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="profile-input"
                required
              >
                <option value="">Select a reason</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide details about the incident..."
                className="profile-textarea"
                rows={6}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-report-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
