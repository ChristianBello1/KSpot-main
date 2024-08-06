import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupById, addComment, deleteComment, likeComment, getUserData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaHeart, FaRegHeart, FaThumbsUp, FaReply, FaChevronDown, FaChevronUp, FaYoutube, FaTwitter, FaFacebook, FaPaperPlane } from 'react-icons/fa';
import './CommentStyles.css';
import './Pages.css';

const GroupDetail = () => {
  const [group, setGroup] = useState(null);
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
    fetchGroup();
  }, [id]);

  useEffect(() => {
    if (user && user.preferiti && group) {
      setIsFavorite(user.preferiti.some(fav => fav.id === group._id && fav.type === 'Group'));
    }
  }, [user, group]);

  useEffect(() => {
    if (group && group.comments) {
      const initialLikedState = {};
      group.comments.forEach(comment => {
        initialLikedState[comment._id] = comment.likes && comment.likes.includes(user?._id);
        if (comment.replies) {
          comment.replies.forEach(reply => {
            initialLikedState[reply._id] = reply.likes && reply.likes.includes(user?._id);
          });
        }
      });
      setLikedComments(initialLikedState);
    }
  }, [group, user]);

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
      forceUpdate({});
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
  
  if (!group) return <div>Loading...</div>;
  
  return (
    <div className="container mt-4 text-white">
      <h1 className="mb-4 title">{group.name}</h1>
      
      <div className="row mb-4">
        <div className="col-md-6 position-relative">
          {user && (
            <button 
              onClick={handleFavoriteToggle} 
              className="btn btn-outline-light favorite-btn position-absolute top-2 left-5 m-2"
              style={{
                transition: 'transform 0.3s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />} {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          )}
          <img src={group.coverImage} alt={group.name} className="img-fluid rounded" />
        </div>
        <div className="col-md-6 d-flex flex-column justify-content-start align-items-start">
          <h1 className="mb-3 title1">Description</h1>
          <p className="text-start">{group.description}</p>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <h2 className='title1 position-absolute'>Group Info</h2>
          <ul style={{marginTop:'55px'}}  className="list-unstyled">
            <li><strong>Type:</strong> {group.type}</li>
            <li><strong>Debut Date:</strong> {new Date(group.debutDate).toLocaleDateString()}</li>
            <li><strong>Company:</strong> {group.company}</li>
            <li><strong>Fanclub Name:</strong> {group.fanclubName}</li>
          </ul>
        </div>
        <div className="col-md-6">
          <h2 className='title1 position-absolute'>Social Media</h2>
          <div style={{marginTop:'55px'}} className="social-icons">
            <a href={group.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaYoutube />
            </a>
            <a href={group.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter />
            </a>
            <a href={group.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>
  
      <div className="members-section mt-5">
        <h2 style={{marginBottom:'40px'}} className='title'>Members</h2>
        <div className="row">
          {group.members.map((member, index) => (
            <div key={member._id || index} className="col-md-4 mb-3">
              <div className="card member-card">
                {member.photo && <img src={member.photo} alt={member.name} className="card-img-top" />}
                <div className="card-body text-dark">
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
  
      <div className="comments-section mt-4">
        <h2 className='title1'>Comments</h2>
        {group.comments && group.comments.length > 0 ? (
          renderComments(group.comments)
        ) : (
          <p className='notfound'>No comments yet.</p>
        )}
      
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="mb-3 position-relative">
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
          <p>Please <Link to="/login" className="text-white">login</Link> to add a comment.</p>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;