const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export default function Login() {
  const handleLogin = () => {
    window.location.href = `${API_BASE}/auth/login`;
  };

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-spotify-green flex items-center justify-center mb-5 shadow-lg shadow-spotify-green/30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Moodmap</h1>
          <p className="text-spotify-text-secondary text-sm mt-2 text-center">
            Visualize your Spotify listening habits
          </p>
        </div>

        {/* Card */}
        <div className="bg-spotify-dark rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-xl mb-1">Welcome back</h2>
          <p className="text-spotify-text-secondary text-sm mb-7">
            Connect your Spotify account to see your stats, top artists, and listening patterns.
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-spotify-green hover:bg-spotify-green-dark text-white font-bold py-3.5 px-6 rounded-full transition-all duration-200 flex items-center justify-center gap-3 text-sm shadow-lg shadow-spotify-green/20 hover:shadow-spotify-green/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Connect with Spotify
          </button>

          <p className="text-spotify-text-secondary text-xs text-center mt-5 leading-relaxed">
            We only read your listening data. We never modify your playlists or play history.
          </p>
        </div>
      </div>
    </div>
  );
}
