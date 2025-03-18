import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { memo, useCallback } from 'react';

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #6c5ce7, #a8a4e6)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(108, 92, 231, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  menu: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  },
  menuItem: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)'
    }
  },
  logoutButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'translateY(-2px)'
    }
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)'
  }
};

const Navbar = memo(function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [logout, navigate]);

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.brand}>
        <span role="img" aria-label="bug">🐛</span>
        Issue Tracker
      </Link>
      <div style={styles.menu}>
        {currentUser ? (
          <>
            <Link to="/dashboard" style={styles.menuItem}>
              Dashboard
            </Link>
            <Link to="/issues" style={styles.menuItem}>
              Issues
            </Link>
            <Link to="/board" style={styles.menuItem}>
              Board
            </Link>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.menuItem}>
              Log In
            </Link>
            <Link to="/signup" style={styles.menuItem}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
});

export default Navbar; 