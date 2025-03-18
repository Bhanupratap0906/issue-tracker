import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Issue Tracker</h1>
        <p className="hero-subtitle">
          A simple, powerful tool to track and manage your project issues
        </p>
        
        {currentUser ? (
          <div className="cta-buttons">
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">Log In</Link>
            <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Issue Tracking</h3>
            <p>Create, update, and track issues with detailed information and status updates.</p>
          </div>
          
          <div className="feature-card">
            <h3>Kanban Board</h3>
            <p>Visualize your workflow with a drag-and-drop Kanban board for easy status updates.</p>
          </div>
          
          <div className="feature-card">
            <h3>Dashboard</h3>
            <p>Get a quick overview of your project status with charts and statistics.</p>
          </div>
          
          <div className="feature-card">
            <h3>Collaboration</h3>
            <p>Comment on issues, assign tasks, and work together with your team.</p>
          </div>
        </div>
      </div>
      
      <div className="how-it-works">
        <h2>How It Works</h2>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up for a free account to get started with Issue Tracker.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Create Issues</h3>
            <p>Add issues with detailed descriptions, priorities, and assignees.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Progress</h3>
            <p>Update statuses, add comments, and track progress on your dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 