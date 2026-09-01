import React from 'react';

export default function BlueprintWrapper({ children, className = '', dark = false, pulseCorners = false, showCorners = false, style }) {
  // Corners are opt-in: only render when showCorners is true, or when
  // pulseCorners is true (the animated contact-form registration marks).
  const renderCorners = showCorners || pulseCorners;
  const cornerClass = `corner ${pulseCorners ? 'corner-pulse' : ''}`;
  return (
    <div className={`blueprint ${dark ? 'blueprint-dark' : ''} ${className}`} style={style}>
      {renderCorners && (
        <>
          <i className={`${cornerClass} tl`}>+</i>
          <i className={`${cornerClass} tr`}>+</i>
          <i className={`${cornerClass} bl`}>+</i>
          <i className={`${cornerClass} br`}>+</i>
        </>
      )}
      {children}
    </div>
  );
}
