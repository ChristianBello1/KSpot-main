import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSoloistById, addComment, deleteComment, likeComment, getUserData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaHeart, FaRegHeart, FaThumbsUp, FaReply, FaChevronDown, FaChevronUp, FaYoutube, FaTwitter, FaPaperPlane, FaInstagram } from 'react-icons/fa';
import './CommentStyles.css';
import './Pages.css';

const SoloistDetail = () => {
  const [soloist, setSoloist] = useState(null);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [, forceUpdate] = useState();
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

  useEffect(() => {
    if (soloist && soloist.comments) {
      const initialLikedState = {};
      soloist.comments.forEach(comment => {
        initialLikedState[comment._id] = comment.likes && comment.likes.includes(user?._id);
        if (comment.replies) {
          comment.replies.forEach(reply => {
            initialLikedState[reply._id] = reply.likes && reply.likes.includes(user?._id);
          });
        }
      });
      setLikedComments(initialLikedState);
    }
  }, [soloist, user]);

  const fetchSoloist = async () => {
    try {
      const response = await getSoloistById(id);
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
      await addComment(id, { text: comment }, false);
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
      forceUpdate({});
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

  const handleReplyCancel = (commentId) => {
    const replyForm = document.querySelector(`#reply-form-${commentId}`);
    if (replyForm) {
      replyForm.classList.remove('show');
      setTimeout(() => {
        setReplyingTo(null);
        setReplyText('');
      }, 300);
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
              <button 
                onClick={() => handleLikeComment(comment._id)} 
                className={`btn btn-link btn-icon like-button ${likedComments[comment._id] ? 'liked' : ''}`}
              >
                <FaThumbsUp /> {comment.likes ? comment.likes.length : 0}
              </button>
              <button onClick={() => setReplyingTo(comment._id)} className="btn btn-link btn-icon">
                <FaReply /> Reply
              </button>
            </>
          )}
          {(user && (user._id === comment.author?._id || user.ruolo === 'admin')) && (
            <button 
              className="btn btn-link btn-icon" 
              onClick={() => handleDeleteComment(comment._id)}
              title="Delete comment"
            >
              <FaTrash />
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
                        <button 
                          onClick={() => handleLikeComment(reply._id)} 
                          className={`btn btn-link btn-icon like-button ${likedComments[reply._id] ? 'liked' : ''}`}
                        >
                          <FaThumbsUp /> {reply.likes ? reply.likes.length : 0}
                        </button>
                      )}
                      {(user && (user._id === reply.author?._id || user.ruolo === 'admin')) && (
                        <button 
                          className="btn btn-link btn-icon" 
                          onClick={() => handleDeleteComment(reply._id)}
                          title="Delete reply"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div id={`reply-form-${comment._id}`} className={`reply-form-container ${replyingTo === comment._id ? 'show' : ''}`}>
          <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="reply-form">
            <div className="mb-3 position-relative">
              <textarea
                className="form-control"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Your reply"
              ></textarea>
              <button type="submit" className="btn btn-link submit-triangle">
                <FaPaperPlane />
              </button>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleReplyCancel(comment._id)}>Cancel</button>
          </form>
        </div>
      </div>
    ));
  };

  const getSocialMediaLink = (url) => {
    if (!url || url.toLowerCase() === 'no') {
      return '/notfound';
    }
    return url;
  };
  
  if (!soloist) return <div>Loading...</div>;
  
  return (
    <div className="container mt-4 text-white">
      <h1 className="mb-4 title">{soloist.stageName}</h1>
      
      <div className="soloist-info-container">
      <div className="soloist-image">
        {user && (
          <button 
            onClick={handleFavoriteToggle} 
            id='btnfav'
            className="btn btn-outline-light favorite-btn position-absolute bottom-2 m-2"
            style={{
              transition: 'transform 0.3s ease',
              transform: 'scale(1)',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />} {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        )}
        <img style={{width:'100%', maxWidth:'480px'}} src={soloist.photo} alt={soloist.name} className="img-fluid rounded object-cover" />
      </div>
      <div className="soloist-details-container">
        <div className="soloist-details-wrapper">
          <div className="soloist-details">
            <h2 className="mb-3 title1">Artist Info</h2>
            <p><strong>Real Name:</strong> {soloist.name}</p>
            <p><strong>Birthday:</strong> {new Date(soloist.birthday).toLocaleDateString()}</p>
            <p><strong>Zodiac Sign:</strong> {soloist.zodiacSign}</p>
            <p><strong>Height:</strong> {soloist.height} cm</p>
            <p><strong>Weight:</strong> {soloist.weight} kg</p>
            <p><strong>MBTI Type:</strong> {soloist.mbtiType}</p>
            <p><strong>Nationality:</strong> {soloist.nationality}</p>
            <p><strong>Company:</strong> {soloist.company}</p>
            <p><strong>Debut Date:</strong> {new Date(soloist.debutDate).toLocaleDateString()}</p>
          </div>
          <div className="soloist-social">
            <h2 className='title1s'>Social Media</h2>
            <div className="social-icons">
              {soloist.socialMedia && soloist.socialMedia.youtube && (
                <Link to={getSocialMediaLink(soloist.socialMedia.youtube)} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <FaYoutube />
                </Link>
              )}
              {soloist.socialMedia && soloist.socialMedia.x && (
                <Link to={getSocialMediaLink(soloist.socialMedia.x)} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <FaTwitter />
                </Link>
              )}
              {soloist.socialMedia && soloist.socialMedia.instagram && (
                <Link to={getSocialMediaLink(soloist.socialMedia.instagram)} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <FaInstagram />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="soloist-bio">
          <h2 className='title1'>Biography</h2>
          <p>{soloist.bio}</p>
        </div>
      </div>
    </div>
  
      <div className="comments-section mt-4">
        <h2 className='title1'>Comments</h2>
        {soloist.comments && soloist.comments.length > 0 ? (
          renderComments(soloist.comments)
        ) : (
          <p style={{marginBottom:'20px'}} className='notfound'>No comments yet.</p>
        )}
      
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="position-relative">
              <textarea 
                className="form-control" 
                id="comment" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              ></textarea>
              <button type="submit" className="btn btn-link submit-triangle">
                <FaPaperPlane />
              </button>
            </div>
          </form>
        ) : (
          <p className="login-prompt">
            Please <Link to="/login" className="login-link">login</Link> to add a comment.
          </p>
        )}
      </div>
    </div>
  );
};

export default SoloistDetail;