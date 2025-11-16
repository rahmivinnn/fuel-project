import React, { useEffect, useState } from 'react';

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return (
    <div className={`page ${ready ? 'animate-page' : ''}`}>{children}</div>
  );
};

export default AnimatedPage;