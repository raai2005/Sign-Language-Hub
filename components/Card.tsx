import React, { useState } from 'react';
import Image from 'next/image';

interface CardProps {
  id: string;
  title: string;
  description: string;
  videoPath?: string;
  thumbnail?: string;
  type: 'letter' | 'word';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  videoPath,
  thumbnail,
  type,
  onClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handleCardClick = () => {
    if (videoPath) {
      setShowVideo(true);
      setIsPlaying(true);
    }
    onClick?.();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
         <div 
       className="bg-white rounded-xl shadow-soft hover:shadow-medium p-4 card-hover cursor-pointer border border-gray-100/50 relative overflow-hidden group"
       onClick={handleCardClick}
     >
       {/* Background gradient overlay */}
       <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-accent-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
       
       <div className="relative">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center space-x-3">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-medium ${
               type === 'letter' 
                 ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
                 : 'bg-gradient-to-r from-accent-500 to-accent-600'
             }`}>
               {type === 'letter' ? title : title.charAt(0)}
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-200">{title}</h3>
               <p className="text-xs text-gray-500 capitalize font-medium">{type}</p>
             </div>
           </div>
           {videoPath && (
             <div className="text-primary-500 group-hover:text-primary-600 transition-colors duration-200">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
               </svg>
             </div>
           )}
         </div>

         <p className="text-gray-600 text-sm leading-relaxed mb-4">
           {description}
         </p>

         {thumbnail && !showVideo && (
           <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-soft">
             <Image
               src={thumbnail}
               alt={`${title} sign`}
               fill
               className="object-cover group-hover:scale-105 transition-transform duration-300"
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.style.display = 'none';
               }}
             />
           </div>
         )}

         {showVideo && videoPath && (
           <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden video-player shadow-medium">
             <video
               src={videoPath}
               autoPlay={isPlaying}
               onEnded={handleVideoEnd}
               className="w-full h-full object-cover"
               controls
               onError={(e) => {
                 console.error('Video error:', e);
                 setShowVideo(false);
               }}
             />
           </div>
         )}

         <div className="mt-4 flex justify-between items-center">
           <span className="text-xs text-gray-400 font-medium">ID: {id}</span>
           {videoPath && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowVideo(!showVideo);
               }}
               className="text-primary-600 hover:text-primary-700 text-xs font-semibold transition-colors duration-200 flex items-center space-x-1"
             >
               <span>{showVideo ? 'Hide Video' : 'Show Video'}</span>
               <svg className={`w-3 h-3 transition-transform duration-200 ${showVideo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
           )}
         </div>
       </div>
     </div>
  );
};

export default Card; 