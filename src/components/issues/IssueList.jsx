import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    async function fetchIssues() {
      try {
        let issuesQuery = collection(db, 'issues');
        
        // Apply filters
        if (filter !== 'all') {
          issuesQuery = query(issuesQuery, where('status', '==', filter));
        }
        
        // Apply sorting
        issuesQuery = query(issuesQuery, orderBy(sortBy, sortDirection));
        
        const issuesSnapshot = await getDocs(issuesQuery);
        let issuesData = issuesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Apply search filter (client-side)
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          issuesData = issuesData.filter(issue => 
            issue.title.toLowerCase().includes(searchLower) || 
            issue.description.toLowerCase().includes(searchLower)
          );
        }
        
        setIssues(issuesData);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, [filter, sortBy, sortDirection, searchTerm]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }

  if (loading) {
    return <div className="loading">Loading issues...</div>;
  }

  return (
    <div className="issues-container">
      <div className="issues-header">
        <h1>Issues</h1>
        <Link to="/issues/new" className="btn btn-primary">New Issue</Link>
      </div>
      
      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Issues</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      {issues.length > 0 ? (
        <div className="issues-table">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('title')}>
                  Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('priority')}>
                  Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('assignee')}>
                  Assignee {sortBy === 'assignee' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Created {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id}>
                  <td>
                    <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                  </td>
                  <td>
                    <span className={`status status-${issue.status.toLowerCase().replace(' ', '-')}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority priority-${issue.priority.toLowerCase()}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td>{issue.assignee || 'Unassigned'}</td>
                  <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-issues">
          <p>No issues found. Create your first issue to get started.</p>
        </div>
      )}
    </div>
  );
} 