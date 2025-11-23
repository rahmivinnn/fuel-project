import React from 'react';

interface GPSPopupModalProps {
  isVisible: boolean;
  onUpgrade: () => void;
  onDismiss: () => void;
}

const GPSPopupModal: React.FC<GPSPopupModalProps> = ({ 
  isVisible, 
  onUpgrade, 
  onDismiss 
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
            Upgrade Location Services
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            For the best experience and accurate realtime tracking, please upgrade your location services. This will ensure you get the most accurate information for nearby fuel stations.
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm transition-colors"
          >
            Enable High Accuracy
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full inline-flex justify-center rounded-full border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm transition-colors"
          >
            Continue with Basic
          </button>
        </div>
      </div>
    </div>
  );
};

export default GPSPopupModal;