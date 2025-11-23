import React, { useState, useEffect } from 'react';

interface CountryRestrictionProps {
  children: React.ReactNode;
}

const CountryRestriction: React.FC<CountryRestrictionProps> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string>('');

  const checkCountry = async () => {
    try {
      setLoading(true);
      const allowedCountries = ['GB', 'US'];
      
      // Try multiple APIs in sequence for better VPN detection
      const apis = [
        { url: 'https://ipapi.co/json/', field: 'country_code' },
        { url: 'https://ipwho.is/?fields=country_code', field: 'country_code' },
        { url: 'https://api.country.is/', field: 'country' },
        { url: 'https://ipinfo.io/json', field: 'country' }
      ];
      
      for (const api of apis) {
        try {
          const response = await fetch(api.url, { 
            method: 'GET',
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) continue;
          
          const data = await response.json();
          const countryCode = data[api.field];
          
          if (countryCode) {
            setDetectedCountry(countryCode);
            if (allowedCountries.includes(countryCode)) {
              setIsAllowed(true);
              return;
            } else {
              setIsAllowed(false);
              return;
            }
          }
        } catch (apiErr) {
          continue;
        }
      }
      
      // If all APIs fail, allow access with warning
      setError('Unable to verify location. Access granted.');
      setIsAllowed(true);
    } catch (err) {
      setError('Location verification failed. Access granted.');
      setIsAllowed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCountry();
  }, []);

  const handleRetry = () => {
    setError(null);
    checkCountry();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2">Verifying your location...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-screen bg-light-bg dark:bg-dark-bg">
        <div className="text-center p-6 max-w-sm">
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-2xl font-bold mb-2">Region Restricted</h1>
          <p className="mb-2 text-light-subtext dark:text-dark-subtext">
            This application is only available in the United Kingdom and United States.
          </p>
          {detectedCountry && (
            <p className="text-sm text-red-500 mb-4">
              Detected location: {detectedCountry}
            </p>
          )}
          <p className="text-sm text-light-subtext dark:text-dark-subtext mb-6">
            Using VPN? Make sure it's connected to US or UK servers.
          </p>
          <div className="space-y-2">
            <button 
              onClick={handleRetry}
              className="w-full bg-primary text-white px-4 py-2 rounded-full font-semibold active:scale-95 transition-transform"
            >
              Retry Verification
            </button>
            <button 
              onClick={() => setIsAllowed(true)}
              className="w-full border-2 border-gray-300 dark:border-gray-600 px-4 py-2 rounded-full font-semibold active:scale-95 transition-transform text-sm"
            >
              Continue Anyway (Testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Show a notification about the error but still allow access
    return (
      <>
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 z-50 rounded shadow-lg">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 text-sm underline"
          >
            Retry
          </button>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
};

export default CountryRestriction;