import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSoloistById, addComment, deleteComment, likeComment, getUserData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaHeart, FaRegHeart, FaThumbsUp, FaReply, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './CommentStyles.css';

const SoloistDetail = () => {
  const [soloist, setSoloist] = useState(null);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const { id } = useParams();
  const { user, addFavorite, removeFavorite, updateUser } = useAuth();

  useEffect(() => {
    fetchSoloist();
  }, [id]);

  useEffect(() => {
    if (user && user.preferiti && soloist) {
      setIsFavorite(user.preferiti.some(fav => fav.id === soloist._id && fav.type === 'Soloist'));
    }
  }, [user, soloist]);

  const fetchSoloist = async () => {
    try {
      const response = await getSoloistById(id);
      console.log("Soloist data:", response.data);
      if (response.data && !response.data.comments) {
        response.data.comments = [];
      }
      setSoloist(response.data);
    } catch (error) {
      console.error('Error fetching soloist:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const commentData = { text: comment };
      await addComment(id, commentData, false);
      setComment('');
      fetchSoloist();
    } catch (error) {
      console.error('Error adding comment:', error.response?.data || error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo commento?')) {
      try {
        await deleteComment(id, commentId, false);
        fetchSoloist();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(id, 'Soloist');
      } else {
        await addFavorite(id, 'Soloist');
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
      await likeComment(id, commentId, false);
      fetchSoloist();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    try {
      await addComment(id, { text: replyText, parentCommentId }, false);
      setReplyText('');
      setReplyingTo(null);
      fetchSoloist();
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

  if (!soloist) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h1>{soloist.name}</h1>
      <img src={soloist.photo} alt={soloist.name} className="artist-image" />
      {user && (
        <button onClick={handleFavoriteToggle} className="btn btn-outline-primary favorite-btn">
          {isFavorite ? <FaHeart /> : <FaRegHeart />} {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      )}
      <div className="artist-info">
        <p><strong>Stage Name:</strong> {soloist.stageName}</p>
        <p><strong>Birthday:</strong> {new Date(soloist.birthday).toLocaleDateString()}</p>
        <p><strong>Zodiac Sign:</strong> {soloist.zodiacSign}</p>
        <p><strong>Height:</strong> {soloist.height} cm</p>
        <p><strong>Weight:</strong> {soloist.weight} kg</p>
        <p><strong>MBTI Type:</strong> {soloist.mbtiType}</p>
        <p><strong>Nationality:</strong> {soloist.nationality}</p>
        <p><strong>Instagram:</strong> <a href={`https://www.instagram.com/${soloist.instagram}`} target="_blank" rel="noopener noreferrer">@{soloist.instagram}</a></p>
        <p><strong>Bio:</strong> {soloist.bio}</p>
        <p><strong>Company:</strong> {soloist.company}</p>
        <p><strong>Debut Date:</strong> {new Date(soloist.debutDate).toLocaleDateString()}</p>
      </div>
      
      <div className="comments-section">
        <h2>Comments</h2>
        {soloist.comments && soloist.comments.length > 0 ? (
          renderComments(soloist.comments)
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

export default SoloistDetail;