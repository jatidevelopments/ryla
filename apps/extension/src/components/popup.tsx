import React, { useEffect, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
  } | null;
}

export const Popup: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication state on mount
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
      if (response?.success) {
        setAuthState({
          isAuthenticated: response.isAuthenticated,
          user: response.user,
        });
      }
      setLoading(false);
    });
  }, []);

  const handleOpenApp = (path?: string) => {
    chrome.runtime.sendMessage({
      type: 'OPEN_APP',
      payload: { path },
    });
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH_STATE' }, () => {
      setAuthState({ isAuthenticated: false, user: null });
    });
  };

  if (loading) {
    return (
      <div className="ryla-popup">
        <div className="ryla-header">
          <div className="ryla-logo">R</div>
          <div>
            <div className="ryla-title">RYLA</div>
            <div className="ryla-subtitle">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ryla-popup">
      {/* Header */}
      <div className="ryla-header">
        <div className="ryla-logo">R</div>
        <div>
          <div className="ryla-title">RYLA</div>
          <div className="ryla-subtitle">AI Influencer Manager</div>
        </div>
      </div>

      {authState.isAuthenticated && authState.user ? (
        <>
          {/* Logged in state */}
          <div className="ryla-card">
            <div className="ryla-status">
              <div className="ryla-status-dot" />
              <span>Connected as {authState.user.name}</span>
            </div>
          </div>

          <div className="ryla-card">
            <h3 style={{ marginBottom: '12px', fontSize: '14px' }}>
              Quick Actions
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <button
                className="ryla-button"
                onClick={() => handleOpenApp('/studio')}
              >
                Open Content Studio
              </button>
              <button
                className="ryla-button ryla-button-secondary"
                onClick={() => handleOpenApp('/characters')}
              >
                My Characters
              </button>
              <button
                className="ryla-button ryla-button-secondary"
                onClick={() => handleOpenApp('/gallery')}
              >
                Image Gallery
              </button>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              className="ryla-button ryla-button-secondary"
              onClick={handleLogout}
              style={{ fontSize: '12px', padding: '8px' }}
            >
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Logged out state */}
          <div className="ryla-card">
            <div className="ryla-status">
              <div className="ryla-status-dot offline" />
              <span>Not connected</span>
            </div>
          </div>

          <div className="ryla-card">
            <p
              style={{
                fontSize: '14px',
                marginBottom: '16px',
                color: 'var(--ryla-text-muted)',
              }}
            >
              Sign in to RYLA to manage your AI influencers and generate content
              directly from your browser.
            </p>
            <button
              className="ryla-button"
              onClick={() => handleOpenApp('/login')}
            >
              Sign In to RYLA
            </button>
          </div>

          <div className="ryla-card">
            <p
              style={{
                fontSize: '13px',
                color: 'var(--ryla-text-muted)',
              }}
            >
              Don't have an account?
            </p>
            <button
              className="ryla-button ryla-button-secondary"
              onClick={() => handleOpenApp('/signup')}
              style={{ marginTop: '8px' }}
            >
              Create Account
            </button>
          </div>
        </>
      )}
    </div>
  );
};
