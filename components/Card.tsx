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
      className="old-school-card bg-white p-6 cursor-pointer relative overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 border-4 border-gray-600 flex items-center justify-center text-white font-bold text-lg">
              {type === 'letter' ? title : title.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold classic-title uppercase">{title}</h3>
              <p className="text-xs classic-subtitle capitalize">{type}</p>
            </div>
          </div>
          {videoPath && (
            <div className="text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

  <p className="text-gray-700 text-sm leading-relaxed mb-4 classic-subtitle wrap-anywhere">
          {description}
        </p>

        {thumbnail && !showVideo && (
          <div className="relative w-full h-32 overflow-hidden">
            <Image
              src={thumbnail}
              alt={`${title} sign`}
              fill
              className="object-cover retro-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {showVideo && videoPath && (
          <div className="relative w-full h-32 overflow-hidden classic-video-player">
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
          <span className="text-xs text-gray-600 font-medium">ID: {id}</span>
          {videoPath && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(!showVideo);
              }}
              className="text-xs font-semibold classic-subtitle hover:text-gray-800 transition-colors duration-150 flex items-center space-x-1"
            >
              <span>{showVideo ? 'Hide Video' : 'Show Video'}</span>
              <svg className={`w-3 h-3 transition-transform duration-150 ${showVideo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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