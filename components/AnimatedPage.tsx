import React, { useEffect, useState } from 'react';

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  
  useEffect(() => { 
    // Slight delay to ensure smooth animation
    const timer = setTimeout(() => setReady(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`page ${ready ? 'animate-page-smooth' : ''}`}>{children}</div>
  );
};

export default AnimatedPage;