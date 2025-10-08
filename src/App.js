import React, { useState, useEffect } from 'react';
import { Film, Heart, Search, ArrowLeft, Star, Filter, TrendingUp, Calendar, X } from 'lucide-react';

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
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === movie.id);
      if (exists) {
        return prev.filter(f => f.id !== movie.id);
      }
      return [...prev, movie];
    });
  };

  const toggleWatchlist = (movie) => {
    setWatchlist(prev => {
      const exists = prev.find(w => w.id === movie.id);
      if (exists) {
        return prev.filter(w => w.id !== movie.id);
      }
      return [...prev, movie];
    });
  };

  const isFavorite = (movieId) => favorites.some(f => f.id === movieId);
  const isInWatchlist = (movieId) => watchlist.some(w => w.id === movieId);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white' }}>
      <Header favCount={favorites.length} />
      <Router>
        <Route path="/" component={(props) => <HomePage {...props} favorites={favorites} toggleFavorite={toggleFavorite} isFavorite={isFavorite} toggleWatchlist={toggleWatchlist} isInWatchlist={isInWatchlist} />} />
        <Route path="/movie/:id" component={(props) => <MovieDetailPage {...props} toggleFavorite={toggleFavorite} isFavorite={isFavorite} toggleWatchlist={toggleWatchlist} isInWatchlist={isInWatchlist} />} />
        <Route path="/favorites" component={(props) => <FavoritesPage {...props} favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/trending" component={(props) => <TrendingPage {...props} toggleFavorite={toggleFavorite} isFavorite={isFavorite} toggleWatchlist={toggleWatchlist} isInWatchlist={isInWatchlist} />} />
        <Route path="/upcoming" component={(props) => <UpcomingPage {...props} toggleFavorite={toggleFavorite} isFavorite={isFavorite} toggleWatchlist={toggleWatchlist} isInWatchlist={isInWatchlist} />} />
      </Router>
    </div>
  );
}

// Header Component
const Header = ({ favCount }) => (
  <header style={{ backgroundColor: '#1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 50 }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link 
            to="/trending" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#374151',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'white',
              transition: 'background-color 0.3s',
              fontSize: '0.875rem'
            }}
          >
            <TrendingUp size={18} />
            <span>Trending</span>
          </Link>
          <Link 
            to="/upcoming" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#374151',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'white',
              transition: 'background-color 0.3s',
              fontSize: '0.875rem'
            }}
          >
            <Calendar size={18} />
            <span>Скоро</span>
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
              transition: 'background-color 0.3s',
              position: 'relative'
            }}
          >
            <Heart size={20} />
            <span>Обране</span>
            {favCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '-0.5rem',
                backgroundColor: '#eab308',
                color: 'black',
                borderRadius: '9999px',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {favCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </div>
  </header>
);

// Home Page Component
const HomePage = ({ favorites, toggleFavorite, isFavorite, toggleWatchlist, isInWatchlist }) => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [showFilters, setShowFilters] = useState(false);
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    fetchGenres();
    fetchPopularMovies(1);
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=uk-UA`);
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchPopularMovies = async (pageNum) => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=uk-UA&page=${pageNum}`;
      
      if (selectedGenre) {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=uk-UA&page=${pageNum}&with_genres=${selectedGenre}&sort_by=${sortBy}`;
      }
      
      if (yearFilter) {
        url += `&primary_release_year=${yearFilter}`;
      }
      
      const response = await fetch(url);
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

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    setPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
  };

  const applyFilters = () => {
    fetchPopularMovies(1);
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSortBy('popularity.desc');
    setYearFilter('');
    setPage(1);
    fetchPopularMovies(1);
  };

  useEffect(() => {
    if (!searchMode && (selectedGenre || sortBy !== 'popularity.desc' || yearFilter)) {
      fetchPopularMovies(1);
    }
  }, [selectedGenre, sortBy, yearFilter]);

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
        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '48rem', margin: '0 auto', marginBottom: '1rem' }}>
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.75rem',
              backgroundColor: '#374151',
              borderRadius: '0.5rem',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <Filter size={20} />
          </button>
        </div>

        {showFilters && (
          <div style={{
            backgroundColor: '#1f2937',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            maxWidth: '48rem',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Фільтри</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>Жанр</label>
              <select
                value={selectedGenre || ''}
                onChange={(e) => handleGenreChange(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="">Всі жанри</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>Сортування</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="popularity.desc">Популярність (спадання)</option>
                <option value="popularity.asc">Популярність (зростання)</option>
                <option value="vote_average.desc">Рейтинг (спадання)</option>
                <option value="vote_average.asc">Рейтинг (зростання)</option>
                <option value="release_date.desc">Дата виходу (новіші)</option>
                <option value="release_date.asc">Дата виходу (старіші)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>Рік випуску</label>
              <input
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                placeholder="Наприклад: 2024"
                min="1900"
                max="2025"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={clearFilters}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#4b5563',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Скинути фільтри
            </button>
          </div>
        )}
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
                isInWatchlist={isInWatchlist(movie.id)}
                toggleWatchlist={toggleWatchlist}
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
const MovieCard = ({ movie, isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist }) => {
  const posterUrl = movie.poster_path 
    ? `${IMG_BASE_URL}${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750/1f2937/ffffff?text=No+Image';

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      position: 'relative'
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
      {movie.vote_average > 0 && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          backgroundColor: '#eab308',
          color: 'black',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Star size={14} fill="currentColor" />
          {movie.vote_average.toFixed(1)}
        </div>
      )}
      
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
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
          {movie.release_date?.split('-')[0] || 'N/A'}
        </p>
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
const MovieDetailPage = ({ params, toggleFavorite, isFavorite, toggleWatchlist, isInWatchlist }) => {
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
    fetchCredits();
    fetchVideos();
    fetchSimilar();
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

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${params.id}/credits?api_key=${API_KEY}`);
      const data = await response.json();
      setCast(data.cast.slice(0, 10));
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${params.id}/videos?api_key=${API_KEY}&language=uk-UA`);
      const data = await response.json();
      setVideos(data.results.filter(v => v.type === 'Trailer' && v.site === 'YouTube').slice(0, 1));
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchSimilar = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${params.id}/similar?api_key=${API_KEY}&language=uk-UA`);
      const data = await response.json();
      setSimilar(data.results.slice(0, 6));
    } catch (error) {
      console.error('Error fetching similar movies:', error);
    }
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
                {movie.budget > 0 && (
                  <span style={{ color: '#9ca3af' }}>Бюджет: ${(movie.budget / 1000000).toFixed(0)}M</span>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                  {isFavorite(movie.id) ? 'В обраному' : 'Додати до обраного'}
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Опис</h2>
                <p style={{ color: '#d1d5db', lineHeight: '1.75' }}>
                  {movie.overview || 'Опис відсутній'}
                </p>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
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

              {movie.production_companies && movie.production_companies.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Виробництво</h2>
                  <p style={{ color: '#d1d5db' }}>
                    {movie.production_companies.map(c => c.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Трейлер</h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videos[0].key}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
              />
            </div>
          </div>
        )}

        {cast.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Акторський склад</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {cast.map(actor => (
                <div key={actor.id} style={{ textAlign: 'center' }}>
                  <img
                    src={actor.profile_path ? `${IMG_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/150x225/374151/ffffff?text=No+Photo'}
                    alt={actor.name}
                    style={{
                      width: '100%',
                      height: '225px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{actor.name}</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Схожі фільми</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {similar.map(movie => (
                <Link key={movie.id} to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'white' }}>
                  <div style={{
                    backgroundColor: '#1f2937',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750/1f2937/ffffff?text=No+Image'}
                      alt={movie.title}
                      style={{ width: '100%', height: '225px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {movie.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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
              isInWatchlist={false}
              toggleWatchlist={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Trending Page Component
const TrendingPage = ({ toggleFavorite, isFavorite, toggleWatchlist, isInWatchlist }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState('week');

  useEffect(() => {
    fetchTrending();
  }, [timeWindow]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&language=uk-UA`);
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
    setLoading(false);
  };

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Trending фільми</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setTimeWindow('day')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: timeWindow === 'day' ? '#dc2626' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Сьогодні
          </button>
          <button
            onClick={() => setTimeWindow('week')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: timeWindow === 'week' ? '#dc2626' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Тиждень
          </button>
        </div>
      </div>

      {loading ? (
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
      ) : (
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
              isInWatchlist={isInWatchlist(movie.id)}
              toggleWatchlist={toggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Upcoming Page Component
const UpcomingPage = ({ toggleFavorite, isFavorite, toggleWatchlist, isInWatchlist }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=uk-UA`);
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
    }
    setLoading(false);
  };

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

      <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>Скоро у прокаті</h1>

      {loading ? (
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
      ) : (
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
              isInWatchlist={isInWatchlist(movie.id)}
              toggleWatchlist={toggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}