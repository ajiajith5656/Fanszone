import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/help-page.css";

interface FAQItem {
  question: string;
  answer: string;
}

export const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const faqs: FAQItem[] = [
    {
      question: "How do I create an account?",
      answer:
        'Click on "Get Started" on the landing page, enter your email, verify with OTP, complete your preferences, upload at least 3 profile images, and submit verification documents.',
    },
    {
      question: "How does verification work?",
      answer:
        "Upload a government-issued ID (age proof) and a selfie. Our admin team will review within 24-48 hours. Verified users get a blue badge on their profile.",
    },
    {
      question: "What are connections?",
      answer:
        "Connections are mutual relationships. Send a connection request to someone you're interested in. If they accept, you become connected and can message each other.",
    },
    {
      question: "How do I report a user?",
      answer:
        "Go to the user's profile, click the Report button, select a reason, and provide additional details. Our team will review and take appropriate action.",
    },
    {
      question: "What is an Exclusive Room?",
      answer:
        "Premium users can create exclusive rooms with special content visible only to selected connections. This feature requires a subscription.",
    },
    {
      question: "How do paid posts work?",
      answer:
        "Some users may post premium content marked as Paid-Public. You'll need to purchase access to view the full content. Payments are secure and processed through our platform.",
    },
    {
      question: "How can I block someone?",
      answer:
        'Go to Connections > Blocked Accounts to view or manage blocked users. To block someone, report them and select "Block this user" option.',
    },
    {
      question: "Can I delete my account?",
      answer:
        "Yes, go to Profile > Settings > Account Settings > Delete Account. Note that this action is permanent and cannot be undone.",
    },
    {
      question: "How do I change my preferences?",
      answer:
        'Go to your Profile page and edit your Looking For, Relationship Type, Orientation, Profession, and Marital Status in the "Preferences" section.',
    },
    {
      question: "What should I do if I forgot my password?",
      answer:
        'On the login page, click "Forgot Password", enter your email, verify the OTP, and set a new password.',
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use AWS Cognito for authentication and encryption for all data. We never share your personal information with third parties without consent.",
    },
    {
      question: "How much does a subscription cost?",
      answer:
        "We offer various subscription tiers with different features. Check the Subscription page in your profile for current pricing and features.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send contact form to API
    alert("Your message has been sent! We'll get back to you within 24 hours.");
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="help-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="help-container">
        <div className="help-header">
          <h1>Help & Support</h1>
          <p>Find answers to common questions or contact us for assistance</p>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <div className="quick-link-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3>FAQs</h3>
            <p>Common questions</p>
          </div>
          <div className="quick-link-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <h3>Live Chat</h3>
            <p>Coming soon</p>
          </div>
          <div className="quick-link-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <h3>Email</h3>
            <p>support@mallucupid.com</p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${expandedIndex === index ? "expanded" : ""}`}>
                <div className="faq-question" onClick={() => toggleFAQ(index)}>
                  <span>{faq.question}</span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="faq-icon"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {expandedIndex === index && <div className="faq-answer">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-section">
          <h2>Still Need Help?</h2>
          <p className="contact-desc">Send us a message and we'll get back to you as soon as possible.</p>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                required
                placeholder="What is this about?"
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                placeholder="Describe your issue or question..."
                rows={6}
              />
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2>Additional Resources</h2>
          <div className="resource-links">
            <a href="/terms" className="resource-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Terms of Service
            </a>
            <a href="/privacy" className="resource-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Privacy Policy
            </a>
            <a href="/community-guidelines" className="resource-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              Community Guidelines
            </a>
            <a href="/safety" className="resource-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Safety Tips
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
