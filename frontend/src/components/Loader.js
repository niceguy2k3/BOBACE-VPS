import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', color = 'yellow', fullScreen = false }) => {
  // Size variants
  const sizeVariants = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };
  
  // Color variants
  const colorVariants = {
    yellow: 'border-yellow-500',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    red: 'border-red-500'
  };
  
  // Bubble animation variants
  const bubbleVariants = {
    initial: { scale: 0.8, opacity: 0.3 },
    animate: { 
      scale: [0.8, 1.2, 0.8], 
      opacity: [0.3, 1, 0.3],
      transition: { 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Staggered animation for bubbles
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  // Choose loader style
  const loaderStyle = Math.floor(Math.random() * 3);
  
  return (
    <div className={`flex justify-center items-center p-4 ${fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : ''}`}>
      {loaderStyle === 0 && (
        // Spinning loader
        <div className={`animate-spin rounded-full ${sizeVariants[size]} border-4 border-neutral-200 border-t-4 ${colorVariants[color]}`}></div>
      )}
      
      {loaderStyle === 1 && (
        // Bubble loader
        <motion.div 
          className="flex space-x-2"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`rounded-full ${colorVariants[color]} bg-current ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-5 w-5'}`}
              variants={bubbleVariants}
            />
          ))}
        </motion.div>
      )}
      
      {loaderStyle === 2 && (
        // Pulse loader
        <div className="relative">
          <div className={`${sizeVariants[size]} rounded-full ${colorVariants[color]} bg-current opacity-75 animate-ping absolute`}></div>
          <div className={`${sizeVariants[size]} rounded-full ${colorVariants[color]} bg-current relative`}></div>
        </div>
      )}
    </div>
  );
};

export default Loader;