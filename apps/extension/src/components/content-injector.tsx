import React, { useState } from 'react';

interface ContentInjectorProps {
  platform: string;
}

/**
 * Floating widget that appears on supported social media platforms
 * Allows quick access to RYLA features while browsing
 */
export const ContentInjector: React.FC<ContentInjectorProps> = ({
  platform,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state on mount
  React.useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
      if (response?.isAuthenticated) {
        setIsAuthenticated(true);
      }
    });
  }, []);

  const handleOpenApp = (path?: string) => {
    chrome.runtime.sendMessage({
      type: 'OPEN_APP',
      payload: { path },
    });
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {isExpanded ? (
        <div
          style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: '16px',
            padding: '16px',
            width: '280px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                R
              </div>
              <span
                style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}
              >
                RYLA
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          </div>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              marginBottom: '12px',
            }}
          >
            Browsing {platform.replace('.com', '')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleOpenApp('/studio')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Generate Content
            </button>
            <button
              onClick={() => handleOpenApp('/gallery')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '1px solid #2a2a4a',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              View Gallery
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span
            style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}
          >
            R
          </span>
        </button>
      )}
    </div>
  );
};
