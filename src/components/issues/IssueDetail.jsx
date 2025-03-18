import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function IssueDetail() {
  const { issueId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedIssue, setEditedIssue] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchIssueAndComments() {
      try {
        // Fetch issue
        const issueDoc = await getDoc(doc(db, 'issues', issueId));
        if (!issueDoc.exists()) {
          navigate('/issues');
          return;
        }
        
        const issueData = { id: issueDoc.id, ...issueDoc.data() };
        setIssue(issueData);
        setEditedIssue(issueData);
        
        // Fetch comments
        const commentsQuery = query(
          collection(db, 'issues', issueId, 'comments'),
          orderBy('createdAt', 'asc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching issue:', error);
        setError('Failed to load issue details');
      } finally {
        setLoading(false);
      }
    }

    fetchIssueAndComments();
  }, [issueId, navigate]);

  async function handleStatusChange(newStatus) {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setIssue({
        ...issue,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  }

  async function handleSaveEdit() {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        ...editedIssue,
        updatedAt: new Date().toISOString()
      });
      
      setIssue({
        ...editedIssue,
        updatedAt: new Date().toISOString()
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating issue:', error);
      setError('Failed to update issue');
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    
    try {
      const commentData = {
        content: newComment,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        createdAt: new Date().toISOString()
      };
      
      const commentRef = await addDoc(
        collection(db, 'issues', issueId, 'comments'),
        commentData
      );
      
      setComments([...comments, { id: commentRef.id, ...commentData }]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  }

  async function handleDeleteIssue() {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'issues', issueId));
      navigate('/issues');
    } catch (error) {
      console.error('Error deleting issue:', error);
      setError('Failed to delete issue');
    }
  }

  if (loading) {
    return <div className="loading">Loading issue details...</div>;
  }

  if (!issue) {
    return <div className="error">Issue not found</div>;
  }

  return (
    <div className="issue-detail">
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="issue-header">
        <div className="back-link">
          <Link to="/issues">← Back to Issues</Link>
        </div>
        
        {editing ? (
          <div className="edit-actions">
            <button onClick={handleSaveEdit} className="btn btn-primary">Save</button>
            <button onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
          </div>
        ) : (
          <div className="issue-actions">
            <button onClick={() => setEditing(true)} className="btn btn-secondary">Edit</button>
            <button onClick={handleDeleteIssue} className="btn btn-danger">Delete</button>
          </div>
        )}
      </div>
      
      <div className="issue-content">
        {editing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={editedIssue.title}
                onChange={(e) => setEditedIssue({...editedIssue, title: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={editedIssue.description}
                onChange={(e) => setEditedIssue({...editedIssue, description: e.target.value})}
                rows="5"
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={editedIssue.status}
                  onChange={(e) => setEditedIssue({...editedIssue, status: e.target.value})}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={editedIssue.priority}
                  onChange={(e) => setEditedIssue({...editedIssue, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="assignee">Assignee</label>
                <input
                  type="text"
                  id="assignee"
                  value={editedIssue.assignee || ''}
                  onChange={(e) => setEditedIssue({...editedIssue, assignee: e.target.value})}
                  placeholder="Unassigned"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1>{issue.title}</h1>
            
            <div className="issue-meta">
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <div className="status-dropdown">
                  <span className={`status status-${issue.status.toLowerCase().replace(' ', '-')}`}>
                    {issue.status}
                  </span>
                  <div className="dropdown-content">
                    <button onClick={() => handleStatusChange('Open')}>Open</button>
                    <button onClick={() => handleStatusChange('In Progress')}>In Progress</button>
                    <button onClick={() => handleStatusChange('Resolved')}>Resolved</button>
                  </div>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Priority:</span>
                <span className={`priority priority-${issue.priority.toLowerCase()}`}>
                  {issue.priority}
                </span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Assignee:</span>
                <span>{issue.assignee || 'Unassigned'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span>{new Date(issue.createdAt).toLocaleString()}</span>
              </div>
              
              {issue.updatedAt && (
                <div className="meta-item">
                  <span className="meta-label">Updated:</span>
                  <span>{new Date(issue.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="issue-description">
              <h3>Description</h3>
              <p>{issue.description}</p>
            </div>
          </>
        )}
      </div>
      
      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.authorName}</span>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <p className="no-comments">No comments yet.</p>
          )}
        </div>
        
        <div className="add-comment">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
          ></textarea>
          <button onClick={handleAddComment} className="btn btn-primary">
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
} 