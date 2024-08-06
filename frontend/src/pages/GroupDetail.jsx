import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupById, addComment, deleteComment, likeComment, getUserData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaHeart, FaRegHeart, FaThumbsUp, FaReply, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './CommentStyles.css';

const GroupDetail = () => {
  const [group, setGroup] = useState(null);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const { id } = useParams();
  const { user, addFavorite, removeFavorite, updateUser } = useAuth();

  useEffect(() => {
    fetchGroup();
  }, [id]);

  useEffect(() => {
    if (user && user.preferiti && group) {
      setIsFavorite(user.preferiti.some(fav => fav.id === group._id && fav.type === 'Group'));
    }
  }, [user, group]);

  const fetchGroup = async () => {
    try {
      const response = await getGroupById(id);
      console.log("Group data:", response.data);
      if (response.data && !response.data.comments) {
        response.data.comments = [];
      }
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment(id, { text: comment }, true);
      setComment('');
      fetchGroup();
    } catch (error) {
      console.error('Error adding comment:', error.response?.data || error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo commento?')) {
      try {
        await deleteComment(id, commentId, true);
        fetchGroup();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(id, 'Group');
      } else {
        await addFavorite(id, 'Group');
      }
      setIsFavorite(!isFavorite);
      const updatedUserData = await getUserData();
      updateUser(updatedUserData);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(id, commentId, true);
      fetchGroup();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    try {
      await addComment(id, { text: replyText, parentCommentId }, true);
      setReplyText('');
      setReplyingTo(null);
      fetchGroup();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderComments = (comments, isReply = false) => {
    if (!comments || !Array.isArray(comments)) {
      return null;
    }
    return comments.filter(comment => !comment.parentComment).map((comment) => (
      <div key={comment._id} className={`comment-container ${isReply ? 'reply-comment' : ''}`}>
        <div className="comment-content">
          <strong>{comment.author ? `${comment.author.nome} ${comment.author.cognome}` : 'Unknown User'}: </strong>
          {comment.text}
        </div>
        <div className="comment-actions">
          {user && (
            <>
              <button onClick={() => handleLikeComment(comment._id)} className="btn btn-sm btn-outline-primary btn-icon">
                <FaThumbsUp /> Like ({comment.likes ? comment.likes.length : 0})
              </button>
              <button onClick={() => setReplyingTo(comment._id)} className="btn btn-sm btn-outline-secondary btn-icon">
                <FaReply /> Reply
              </button>
            </>
          )}
          {(user && (user._id === comment.author?._id || user.ruolo === 'admin')) && (
            <button 
              className="btn btn-sm btn-danger btn-icon" 
              onClick={() => handleDeleteComment(comment._id)}
              title="Delete comment"
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies-section">
            <button 
              className="btn btn-link replies-toggle" 
              onClick={() => toggleReplies(comment._id)}
            >
              {expandedComments[comment._id] ? (
                <>
                  <FaChevronUp /> Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </>
              ) : (
                <>
                  <FaChevronDown /> View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </>
              )}
            </button>
            {expandedComments[comment._id] && (
              <div className="replies-container">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="reply-comment">
                    <div className="comment-content">
                      <strong>{reply.author ? `${reply.author.nome} ${reply.author.cognome}` : 'Unknown User'}: </strong>
                      {reply.text}
                    </div>
                    <div className="comment-actions">
                      {user && (
                        <button onClick={() => handleLikeComment(reply._id)} className="btn btn-sm btn-outline-primary btn-icon">
                          <FaThumbsUp /> Like ({reply.likes ? reply.likes.length : 0})
                        </button>
                      )}
                      {(user && (user._id === reply.author?._id || user.ruolo === 'admin')) && (
                        <button 
                          className="btn btn-sm btn-danger btn-icon" 
                          onClick={() => handleDeleteComment(reply._id)}
                          title="Delete reply"
                        >
                          <FaTrash /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {replyingTo === comment._id && (
          <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="reply-form">
            <div className="mb-3">
              <textarea
                className="form-control"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Your reply"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Submit Reply</button>
            <button type="button" className="btn btn-secondary btn-sm ml-2" onClick={() => setReplyingTo(null)}>Cancel</button>
          </form>
        )}
      </div>
    ));
  };

  if (!group) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h1>{group.name}</h1>
      <img src={group.coverImage} alt={group.name} className="artist-image" />
      {user && (
        <button onClick={handleFavoriteToggle} className="btn btn-outline-primary favorite-btn">
          {isFavorite ? <FaHeart /> : <FaRegHeart />} {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      )}
      <div className="artist-info">
        <p><strong>Description:</strong> {group.description}</p>
        <p><strong>Type:</strong> {group.type}</p>
        <p><strong>Debut Date:</strong> {new Date(group.debutDate).toLocaleDateString()}</p>
        <p><strong>Company:</strong> {group.company}</p>
        <p><strong>Fanclub Name:</strong> {group.fanclubName}</p>
      </div>
      
      <div className="social-media-links">
        <h2>Social Media</h2>
        <ul>
          <li><strong>YouTube:</strong> <a href={group.socialMedia.youtube} target="_blank" rel="noopener noreferrer">{group.socialMedia.youtube}</a></li>
          <li><strong>Twitter:</strong> <a href={group.socialMedia.twitter} target="_blank" rel="noopener noreferrer">{group.socialMedia.twitter}</a></li>
          <li><strong>Facebook:</strong> <a href={group.socialMedia.facebook} target="_blank" rel="noopener noreferrer">{group.socialMedia.facebook}</a></li>
        </ul>
      </div>
      
      <div className="members-section">
        <h2>Members</h2>
        <div className="row">
          {group.members.map((member, index) => (
            <div key={member._id || index} className="col-md-4 mb-3">
              <div className="card member-card">
                {member.photo && <img src={member.photo} alt={member.name} className="card-img-top" />}
                <div className="card-body">
                  <h5 className="card-title">{member.name}</h5>
                  {member.stageName && <p><strong>Stage Name:</strong> {member.stageName}</p>}
                  {member.birthday && <p><strong>Birthday:</strong> {new Date(member.birthday).toLocaleDateString()}</p>}
                  {member.position && <p><strong>Position:</strong> {Array.isArray(member.position) ? member.position.join(', ') : member.position}</p>}
                  {member.height && <p><strong>Height:</strong> {member.height} cm</p>}
                  {member.weight && <p><strong>Weight:</strong> {member.weight} kg</p>}
                  {member.mbtiType && <p><strong>MBTI Type:</strong> {member.mbtiType}</p>}
                  {member.nationality && <p><strong>Nationality:</strong> {member.nationality}</p>}
                  {member.instagram && <p><strong>Instagram:</strong> <a href={`https://www.instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer">@{member.instagram}</a></p>}
                  {member.bio && <p><strong>Bio:</strong> {member.bio}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  
      <div className="comments-section">
        <h2>Comments</h2>
        {group.comments && group.comments.length > 0 ? (
          renderComments(group.comments)
        ) : (
          <p>No comments yet.</p>
        )}
      
        {user ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">Add a comment:</label>
              <textarea 
                className="form-control" 
                id="comment" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit Comment</button>
          </form>
        ) : (
          <p>Please <Link to="/login">login</Link> to add a comment.</p>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;