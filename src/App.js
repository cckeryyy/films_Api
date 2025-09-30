import React, { useState, useEffect } from 'react';
import { Film, Heart, Search, ArrowLeft, Star } from 'lucide-react';

// API Configuration
const API_KEY = 'c45a857c193f6302f2b5061c3b85e743';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Router simulation
const Router = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return React.Children.map(children, child => 
    React.cloneElement(child, { currentPath })
  );
};

const Route = ({ path, component: Component, currentPath }) => {
  const pathRegex = new RegExp('^' + path.replace(/:[^\s/]+/g, '([^/]+)') + '$');
  const match = currentPath.match(pathRegex);
  
  if (!match) return null;
  
  const params = {};
  const paramNames = (path.match(/:[^\s/]+/g) || []).map(p => p.slice(1));
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });
  
  return <Component params={params} />;
};

const Link = ({ to, children, className, style }) => (
  <a 
    href={`#${to}`} 
    className={className}
    style={style}
    onClick={(e) => {
      e.preventDefault();
      window.location.hash = to;
    }}
  >
    {children}
  </a>
);

// Main App Component
export default function App() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('movieFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === movie.id);
      if (exists) {
        return prev.filter(f => f.id !== movie.id);
      }
      return [...prev, movie];
    });
  };

  const isFavorite = (movieId) => favorites.some(f => f.id === movieId);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white' }}>
      <Header />
      <Router>
        <Route path="/" component={(props) => <HomePage {...props} favorites={favorites} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />} />
        <Route path="/movie/:id" component={(props) => <MovieDetailPage {...props} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />} />
        <Route path="/favorites" component={(props) => <FavoritesPage {...props} favorites={favorites} toggleFavorite={toggleFavorite} />} />
      </Router>
    </div>
  );
}

// Header Component
const Header = () => (
  <header style={{ backgroundColor: '#1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#ef4444',
            textDecoration: 'none'
          }}
        >
          <Film size={32} />
          <span>Каталог фільмів</span>
        </Link>
        <Link 
          to="/favorites" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            color: 'white',
            transition: 'background-color 0.3s'
          }}
        >
          <Heart size={20} />
          <span>Обране</span>
        </Link>
      </nav>
    </div>
  </header>
);

// Home Page Component
const HomePage = ({ favorites, toggleFavorite, isFavorite }) => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    fetchPopularMovies(1);
  }, []);

  const fetchPopularMovies = async (pageNum) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=uk-UA&page=${pageNum}`);
      const data = await response.json();
      setMovies(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
      setTotalPages(data.total_pages);
      setPage(pageNum);
      setSearchMode(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
    setLoading(false);
  };

  const searchMovies = async (pageNum = 1) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=uk-UA&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`);
      const data = await response.json();
      setMovies(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
      setTotalPages(data.total_pages);
      setPage(pageNum);
      setSearchMode(true);
    } catch (error) {
      console.error('Error searching movies:', error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    searchMovies(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    if (searchMode) {
      searchMovies(nextPage);
    } else {
      fetchPopularMovies(nextPage);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} 
              size={20} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Пошук фільмів..."
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              borderRadius: '0.5rem',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              marginLeft:'5rem'
            }}
          >
            Шукати
          </button>
        </div>
      </div>

      {loading && movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{
            display: 'inline-block',
            width: '3rem',
            height: '3rem',
            border: '3px solid #dc2626',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#9ca3af' }}>Завантаження...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>Фільми не знайдено</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {movies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={isFavorite(movie.id)}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
          
          {page < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Завантаження...' : 'Завантажити ще'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie, isFavorite, toggleFavorite }) => {
  const posterUrl = movie.poster_path 
    ? `${IMG_BASE_URL}${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750/1f2937/ffffff?text=No+Image';

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s, box-shadow 0.3s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.5)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    }}
    >
      <Link to={`/movie/${movie.id}`}>
        <img 
          src={posterUrl} 
          alt={movie.title} 
          style={{ width: '100%', height: '20rem', objectFit: 'cover' }} 
        />
      </Link>
      <div style={{ padding: '1rem' }}>
        <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'white' }}>
          <h3 style={{
            fontWeight: '600',
            fontSize: '1.125rem',
            marginBottom: '0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {movie.title}
          </h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link 
            to={`/movie/${movie.id}`}
            style={{
              fontSize: '0.875rem',
              color: '#ef4444',
              textDecoration: 'none'
            }}
          >
            Детальніше →
          </Link>
          <button
            onClick={() => toggleFavorite(movie)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '9999px',
              color: isFavorite ? '#ef4444' : '#9ca3af',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Movie Detail Page Component
const MovieDetailPage = ({ params, toggleFavorite, isFavorite }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [params.id]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/${params.id}?api_key=${API_KEY}&language=uk-UA`);
      const data = await response.json();
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{
          display: 'inline-block',
          width: '3rem',
          height: '3rem',
          border: '3px solid #dc2626',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!movie) {
    return <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '1.25rem' }}>Фільм не знайдено</div>;
  }

  const posterUrl = movie.poster_path 
    ? `${IMG_BASE_URL}${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750/1f2937/ffffff?text=No+Image';

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : null;

  return (
    <div>
      {backdropUrl && (
        <div 
          style={{
            height: '24rem',
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent, #111827)'
          }}></div>
        </div>
      )}
      
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Link 
          to="/" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#ef4444',
            textDecoration: 'none',
            marginBottom: '1.5rem'
          }}
        >
          <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
          Назад до каталогу
        </Link>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', '@media (min-width: 768px)': { flexDirection: 'row' } }}>
            <div style={{ flex: '0 0 auto', maxWidth: '300px' }}>
              <img src={posterUrl} alt={movie.title} style={{ width: '100%', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.5)' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{movie.title}</h1>
              
              {movie.tagline && (
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: '1rem' }}>{movie.tagline}</p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#eab308',
                  color: 'black',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontWeight: 'bold'
                }}>
                  <Star size={16} style={{ marginRight: '0.25rem' }} fill="currentColor" />
                  {movie.vote_average.toFixed(1)}
                </div>
                <span style={{ color: '#9ca3af' }}>{movie.release_date?.split('-')[0]}</span>
                <span style={{ color: '#9ca3af' }}>{movie.runtime} хв</span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={() => toggleFavorite(movie)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    backgroundColor: isFavorite(movie.id) ? '#dc2626' : '#374151',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <Heart size={20} fill={isFavorite(movie.id) ? 'currentColor' : 'none'} />
                  {isFavorite(movie.id) ? 'Видалити з обраного' : 'Додати до обраного'}
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Опис</h2>
                <p style={{ color: '#d1d5db', lineHeight: '1.75' }}>
                  {movie.overview || 'Опис відсутній'}
                </p>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Жанри</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {movie.genres.map(genre => (
                      <span 
                        key={genre.id} 
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#374151',
                          borderRadius: '9999px',
                          fontSize: '0.875rem'
                        }}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Favorites Page Component
const FavoritesPage = ({ favorites, toggleFavorite }) => {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link 
        to="/" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#ef4444',
          textDecoration: 'none',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
        Назад до каталогу
      </Link>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>Обране</h1>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Heart size={64} style={{ margin: '0 auto 1rem', color: '#4b5563' }} />
          <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>Ваш список обраного порожній</p>
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: '#ef4444',
              textDecoration: 'none'
            }}
          >
            Додати фільми →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {favorites.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={true}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};