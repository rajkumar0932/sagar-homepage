import React, { useRef } from 'react';
import './Sidebar.css'; 

// Import an icon for uploading
import { FaCamera } from 'react-icons/fa';

const Sidebar = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  photoURL, // <-- NEW: Get the photo URL
  onLogout,
  isDynamicBackground,
  onToggleBackground,
  onImageUpload, // <-- NEW: Function to handle the upload
  isUploading, // <-- NEW: State to show loading
  uploadProgress // <-- NEW: Progress percentage
}) => {

  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };
  
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      ></div>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-col items-center gap-4 mb-12 text-center">
            
            {/* --- MODIFIED PROFILE PICTURE SECTION --- */}
            <div className="relative profile-pic-container">
              <img
                src={photoURL || "/profile.jpg"} // Use uploaded photo or fallback to default
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-purple-400 object-cover"
              />
              
              {/* Uploading Overlay */}
              {isUploading && (
                <div className="upload-overlay">
                  <div className="loader-sidebar"></div>
                  <span className="upload-progress-text">{Math.round(uploadProgress)}%</span>
                </div>
              )}

              {/* Upload Icon */}
              {!isUploading && (
                <div className="upload-icon" onClick={handleIconClick}>
                  <FaCamera />
                </div>
              )}
            </div>
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onImageUpload} 
              style={{ display: 'none' }}
              accept="image/png, image/jpeg"
            />
            {/* --- END OF MODIFIED SECTION --- */}

            <div>
              <h3 className="font-bold text-xl text-white">{userName}</h3>
            </div>
          </div>
          
          <div className="sidebar-actions space-y-6 mt-auto">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-200">Animated BG</span>
                <input
                    type="checkbox"
                    id="checkbox-sidebar"
                    checked={isDynamicBackground}
                    onChange={onToggleBackground}
                />
                <label htmlFor="checkbox-sidebar" className="switch">
                    <svg
                        className="slider"
                        viewBox="0 0 512 512"
                        height="1em"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"
                    ></path>
                    </svg>
                </label>
            </div>

            <button
              onClick={onLogout}
              className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-red-500 hover:bg-opacity-50 transition-colors flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="logout-icon-sidebar">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;