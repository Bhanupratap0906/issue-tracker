import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';

export default function Board() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const columns = [
    { id: 'open', title: 'Open', status: 'Open' },
    { id: 'in-progress', title: 'In Progress', status: 'In Progress' },
    { id: 'resolved', title: 'Resolved', status: 'Resolved' }
  ];

  useEffect(() => {
    async function fetchIssues() {
      try {
        const issuesQuery = query(collection(db, 'issues'));
        const issuesSnapshot = await getDocs(issuesQuery);
        const issuesData = issuesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIssues(issuesData);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, []);

  async function handleDragStart(e, issueId) {
    e.dataTransfer.setData('issueId', issueId);
  }

  async function handleDrop(e, targetStatus) {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('issueId');
    
    try {
     
      await updateDoc(doc(db, 'issues', issueId), {
        status: targetStatus,
        updatedAt: new Date().toISOString()
      });
      
    
      setIssues(issues.map(issue => {
        if (issue.id === issueId) {
          return { ...issue, status: targetStatus, updatedAt: new Date().toISOString() };
        }
        return issue;
      }));
    } catch (error) {
      console.error('Error updating issue status:', error);
      setError('Failed to update issue status');
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  if (loading) {
    return <div className="loading">Loading board...</div>;
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>Issue Board</h1>
        <Link to="/issues/new" className="btn btn-primary">New Issue</Link>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="board">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="board-column"
            onDrop={(e) => handleDrop(e, column.status)}
            onDragOver={handleDragOver}
          >
            <div className="column-header">
              <h2>{column.title}</h2>
              <span className="issue-count">
                {issues.filter(issue => issue.status === column.status).length}
              </span>
            </div>
            
            <div className="column-content">
              {issues
                .filter(issue => issue.status === column.status)
                .map(issue => (
                  <div 
                    key={issue.id} 
                    className="board-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                  >
                    <div className="card-header">
                      <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                    </div>
                    <div className="card-content">
                      <p>{issue.description.substring(0, 80)}...</p>
                    </div>
                    <div className="card-footer">
                      <span className={`priority priority-${issue.priority.toLowerCase()}`}>
                        {issue.priority}
                      </span>
                      <span className="assignee">{issue.assignee || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
                
              {issues.filter(issue => issue.status === column.status).length === 0 && (
                <div className="empty-column">No issues</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 