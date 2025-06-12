// components/PostContent.js
import React, { useRef, useState, useEffect, memo } from 'react';

const PostContent = memo(({ post, isExpanded, onToggleExpand }) => {
  const content = post.content || "";
  const contentRef = useRef(null);
  const [needsTruncate, setNeedsTruncate] = useState(false);

  useEffect(() => {
    if (contentRef.current && !isExpanded) {
      const maxHeight = 104; // 約6em = 3行分
      setNeedsTruncate(contentRef.current.scrollHeight > maxHeight);
    }
  }, [content, isExpanded]);

  return (
    <>
      <div className={`post-content-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div
          className="post-content ql-editor"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      {!isExpanded && needsTruncate && (
        <div className="read-more-wrapper">
          <button className="read-more-button" onClick={onToggleExpand}>
            もっと見る
          </button>
        </div>
      )}
    </>
  );
});

export default PostContent;
