import React from 'react';
import { motion } from 'framer-motion';

const ChatMessageToast = ({ sender, avatar, message, isCentered }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: isCentered ? 20 : 10, scale: isCentered ? 0.9 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: isCentered ? 0.9 : 1 }}
      className={`flex flex-col items-center bg-white rounded-lg shadow-lg p-4 max-w-xs mx-auto ${isCentered ? 'border border-yellow-300' : ''}`}
    >
      <div className="w-full flex justify-center mb-2">
        <div className={`${isCentered ? 'h-20 w-20' : 'h-16 w-16'} rounded-full overflow-hidden border-2 ${isCentered ? 'border-yellow-400 shadow-md' : 'border-yellow-200'}`}>
          {avatar ? (
            <img 
              src={avatar} 
              alt={sender} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {sender.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className={`font-medium ${isCentered ? 'text-lg' : ''} text-gray-800`}>{sender}</p>
        <p className={`${isCentered ? 'text-base font-medium' : 'text-sm'} text-gray-600 mt-1 ${isCentered ? 'line-clamp-3' : 'line-clamp-2'}`}>{message}</p>
      </div>
    </motion.div>
  );
};

export default ChatMessageToast;