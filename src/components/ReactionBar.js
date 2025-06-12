import React from 'react';
import { FaRegCommentDots, FaRetweet, FaHeart, FaPlus } from 'react-icons/fa';
import './ReactionBar.css';
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const ReactionBar = ({
  post,
  onToggleComment,
  onToggleReaction,
  onRepost,
  reactions,
  commentCount
}) => {
  const likeCount = reactions?.counts?.like || 0;
  const isLiked = reactions?.userReactions?.like;
  const retweetCount = reactions?.counts?.repost || 0;
  const isRetweeted = reactions?.userReactions?.repost;
  const displayCommentCount = reactions?.counts?.comment ?? commentCount ?? 0;

  return (
<div className="reactions-bar minimal" onClick={(e) => e.stopPropagation()}>
  <button className="action-button transparent" onClick={(e) => { e.stopPropagation(); onToggleComment(post.id); }}>
    <div className="reaction-item">
      <FaRegCommentDots />
      <span>{displayCommentCount}</span>
    </div>
  </button>

  <button className={`action-button transparent ${isLiked ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleReaction(post.id, 'like'); }}>
    <div className="reaction-item">
      <FaHeart className="icon-heart" />
      <span>{likeCount}</span>
    </div>
  </button>

  <button className={`action-button transparent ${isRetweeted ? 'retweeted' : ''}`} onClick={(e) => { e.stopPropagation(); onRepost?.(post); }}>
    <div className="reaction-item">
      <FaRetweet className="icon-retweet" />
      <span>{retweetCount}</span>
    </div>
  </button>

  <button className="action-button transparent" onClick={(e) => e.stopPropagation()}>
    <FaPlus />
  </button>
</div>
  );
};

export default ReactionBar;
