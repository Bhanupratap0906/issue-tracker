import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;
const INITIAL_LOAD_COUNT = 10;

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  statCard: {
    background: 'linear-gradient(135deg, #6c5ce7, #a8a4e6)',
    borderRadius: '15px',
    padding: '1.5rem',
    color: 'white',
    boxShadow: '0 10px 20px rgba(108, 92, 231, 0.2)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },
  statTitle: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    opacity: 0.9
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: '0'
  },
  viewAllButton: {
    background: '#6c5ce7',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background 0.3s ease',
    ':hover': {
      background: '#5b4cc4'
    }
  },
  issuesList: {
    display: 'grid',
    gap: '1rem'
  },
  issueCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-3px)'
    }
  },
  issueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  issueTitle: {
    fontSize: '1.2rem',
    color: '#2c3e50',
    textDecoration: 'none',
    fontWeight: '600',
    ':hover': {
      color: '#6c5ce7'
    }
  },
  statusBadge: {
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  statusOpen: {
    backgroundColor: '#ffeaa7',
    color: '#fdcb6e'
  },
  statusInProgress: {
    backgroundColor: '#81ecec',
    color: '#00cec9'
  },
  statusResolved: {
    backgroundColor: '#55efc4',
    color: '#00b894'
  },
  issueDescription: {
    color: '#636e72',
    marginBottom: '1rem',
    lineHeight: '1.6'
  },
  issueMeta: {
    display: 'flex',
    gap: '1rem',
    color: '#b2bec3',
    fontSize: '0.9rem'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
    color: '#6c5ce7'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    textAlign: 'center'
  },
  errorMessage: {
    color: '#d63031',
    marginBottom: '1rem',
    fontSize: '1.2rem'
  },
  retryButton: {
    background: '#6c5ce7',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background 0.3s ease',
    ':hover': {
      background: '#5b4cc4'
    }
  }
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [recentIssues, setRecentIssues] = useState([]);
  const [issueStats, setIssueStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchIssueStats = useCallback(async () => {
    try {
      const allIssuesQuery = query(collection(db, 'issues'));
      const snapshot = await getDocs(allIssuesQuery);
      
      const stats = {
        total: snapshot.size,
        open: 0,
        inProgress: 0,
        resolved: 0
      };

      snapshot.forEach(doc => {
        const issue = doc.data();
        if (issue.status === 'Open') stats.open++;
        else if (issue.status === 'In Progress') stats.inProgress++;
        else if (issue.status === 'Resolved') stats.resolved++;
      });

      setIssueStats(stats);
    } catch (error) {
      console.error('Error fetching issue stats:', error);
      throw new Error('Failed to fetch issue statistics');
    }
  }, []);

  const fetchRecentIssues = useCallback(async (startAfterDoc = null) => {
    try {
      let recentIssuesQuery = query(
        collection(db, 'issues'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (startAfterDoc) {
        recentIssuesQuery = query(
          collection(db, 'issues'),
          orderBy('createdAt', 'desc'),
          startAfter(startAfterDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(recentIssuesQuery);
      const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (startAfterDoc) {
        setRecentIssues(prev => [...prev, ...issues]);
      } else {
        setRecentIssues(issues);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching recent issues:', error);
      throw new Error('Failed to fetch recent issues');
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      await fetchRecentIssues(lastVisible);
    } catch (error) {
      console.error('Error loading more issues:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore, loadingMore, fetchRecentIssues]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        await Promise.all([
          fetchIssueStats(),
          fetchRecentIssues()
        ]);
        setError('');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data. Please check your connection and try again.');
        
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, backoffTime);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser, retryCount, fetchIssueStats, fetchRecentIssues]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={handleRetry} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return { ...styles.statusBadge, ...styles.statusOpen };
      case 'in progress':
        return { ...styles.statusBadge, ...styles.statusInProgress };
      case 'resolved':
        return { ...styles.statusBadge, ...styles.statusResolved };
      default:
        return styles.statusBadge;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Dashboard</h1>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Issues</h3>
          <p style={styles.statNumber}>{issueStats.total}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Open</h3>
          <p style={styles.statNumber}>{issueStats.open}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>In Progress</h3>
          <p style={styles.statNumber}>{issueStats.inProgress}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Resolved</h3>
          <p style={styles.statNumber}>{issueStats.resolved}</p>
        </div>
      </div>

      <div>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Issues</h2>
          <Link to="/issues" style={styles.viewAllButton}>
            View All
          </Link>
        </div>
        
        {recentIssues.length > 0 ? (
          <>
            <div style={styles.issuesList}>
              {recentIssues.map(issue => (
                <div key={issue.id} style={styles.issueCard}>
                  <div style={styles.issueHeader}>
                    <h3>
                      <Link to={`/issues/${issue.id}`} style={styles.issueTitle}>
                        {issue.title}
                      </Link>
                    </h3>
                    <span style={getStatusStyle(issue.status)}>
                      {issue.status}
                    </span>
                  </div>
                  <p style={styles.issueDescription}>
                    {issue.description.substring(0, 100)}...
                  </p>
                  <div style={styles.issueMeta}>
                    <span>Priority: {issue.priority}</span>
                    <span>Assigned to: {issue.assignee || 'Unassigned'}</span>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  onClick={loadMore} 
                  disabled={loadingMore}
                  style={{
                    ...styles.retryButton,
                    opacity: loadingMore ? 0.7 : 1,
                    cursor: loadingMore ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <p>No issues found. <Link to="/issues/new" style={styles.viewAllButton}>Create your first issue</Link></p>
        )}
      </div>
    </div>
  );
} 