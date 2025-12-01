import React from 'react';

export const BeeLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" fill="#FDE047" stroke="#1E3A8A" strokeWidth="4" />
    <path
      d="M30 40C30 40 40 30 50 40C60 30 70 40 70 40"
      stroke="#1E3A8A"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="35" cy="55" r="5" fill="#1E3A8A" />
    <circle cx="65" cy="55" r="5" fill="#1E3A8A" />
    <path
      d="M45 70Q50 75 55 70"
      stroke="#1E3A8A"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M20 50H10M90 50H80"
      stroke="#1E3A8A"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M25 25L15 15M75 25L85 15"
      stroke="#1E3A8A"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);