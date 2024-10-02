import React from 'react';

const TruncateText = ({ text, maxLength }) => {
  if (text.length <= maxLength) return text;
  return (
    <span title={text}>
      {text.slice(0, maxLength)}...
    </span>
  );
};

export default TruncateText;