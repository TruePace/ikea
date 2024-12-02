import React, { useState, useCallback } from 'react';
import { BiLike, BiDislike } from "react-icons/bi";

const LikeDislikeButtons = ({ 
  contentId, 
  initialLikes = 0, 
  initialDislikes = 0, 
  initialUserInteraction = null,
  onInteraction 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState(initialUserInteraction);
  const [counts, setCounts] = useState({
    likes: initialLikes,
    dislikes: initialDislikes
  });

  const handleInteraction = useCallback(async (action) => {
    if (isProcessing) return; // Prevent rapid clicking

    setIsProcessing(true);
    
    try {
      // If clicking the same button that's already active, we're removing the interaction
      const isRemoving = currentInteraction === action;
      
      // Calculate new counts based on the action
      const newCounts = { ...counts };
      
      if (isRemoving) {
        // Remove the current interaction
        if (action === 'like') newCounts.likes = Math.max(0, counts.likes - 1);
        if (action === 'dislike') newCounts.dislikes = Math.max(0, counts.dislikes - 1);
        setCurrentInteraction(null);
      } else {
        // If switching from one interaction to another
        if (currentInteraction) {
          // Remove the old interaction
          if (currentInteraction === 'like') newCounts.likes = Math.max(0, counts.likes - 1);
          if (currentInteraction === 'dislike') newCounts.dislikes = Math.max(0, counts.dislikes - 1);
        }
        
        // Add the new interaction
        if (action === 'like') newCounts.likes++;
        if (action === 'dislike') newCounts.dislikes++;
        setCurrentInteraction(action);
      }

      // Update local state immediately for better UX
      setCounts(newCounts);
      
      // Call the parent's onInteraction handler
      await onInteraction(action);
    } catch (error) {
      // Revert the counts on error
      setCounts({
        likes: initialLikes,
        dislikes: initialDislikes
      });
      setCurrentInteraction(initialUserInteraction);
      console.error('Error processing interaction:', error);
    } finally {
      // Add a small delay before allowing new interactions
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  }, [isProcessing, currentInteraction, counts, initialLikes, initialDislikes, initialUserInteraction, onInteraction]);

  return (
    // <div className="flex gap-4">
    <>
      <button 
        onClick={() => handleInteraction('like')}
        disabled={isProcessing}
        className={`flex flex-col items-center transition-colors ${
          currentInteraction === 'like' 
            ? 'text-blue-500' 
            : 'text-gray-500 dark:text-gray-200'
        }`}
      >
        <BiLike size="1.6em" className="mb-1" />
        <span className="text-xs">({counts.likes})</span>
      </button>

      <button 
        onClick={() => handleInteraction('dislike')}
        disabled={isProcessing}
        className={`flex flex-col items-center transition-colors ${
          currentInteraction === 'dislike' 
            ? 'text-red-500' 
            : 'text-gray-500 dark:text-gray-200'
        }`}
      >
        <BiDislike size="1.6em" className="mb-1" />
        <span className="text-xs">({counts.dislikes})</span>
      </button>
    {/* </div> */}
    </>
  );
};

export default LikeDislikeButtons;