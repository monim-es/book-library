import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================
// AUTH UTILITIES
// ============================================
const authStorage = {
  users: [],
  currentUser: null
};

const registerUser = (username, email, password) => {
  if (authStorage.users.find(u => u.email === email)) {
    return { success: false, message: 'User already exists' };
  }
  
  const newUser = { id: Date.now(), username, email, password };
  authStorage.users.push(newUser);
  return { success: true, user: newUser };
};

const loginUser = (email, password) => {
  const user = authStorage.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    authStorage.currentUser = user;
    return { success: true, user };
  }
  
  return { success: false, message: 'Invalid credentials' };
};

const logoutUser = () => {
  authStorage.currentUser = null;
};

const getCurrentUser = () => {
  return authStorage.currentUser;
};

// ============================================
// FAVORITES UTILITIES
// ============================================
const favoritesStorage = {};

const getFavorites = (userId) => {
  return favoritesStorage[userId] || [];
};

const addToFavorites = (userId, book) => {
  if (!favoritesStorage[userId]) {
    favoritesStorage[userId] = [];
  }
  if (!favoritesStorage[userId].find(b => b.key === book.key)) {
    favoritesStorage[userId].push(book);
    return true;
  }
  return false;
};

const removeFromFavorites = (userId, bookKey) => {
  if (favoritesStorage[userId]) {
    favoritesStorage[userId] = favoritesStorage[userId].filter(b => b.key !== bookKey);
  }
};

const isFavorite = (userId, bookKey) => {
  return favoritesStorage[userId]?.some(b => b.key === bookKey) || false;
};

// ============================================
// API UTILITIES
// ============================================
const BASE_URL = 'https://openlibrary.org';

const searchBooks = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`
    );
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

const getBookDetails = async (workId) => {
  try {
    const response = await fetch(`${BASE_URL}${workId}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

const getCoverUrl = (coverId, size = 'M') => {
  if (!coverId) return 'https://via.placeholder.com/200x300?text=No+Cover';
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const result = loginUser(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const register = (username, email, password) => {
    const result = registerUser(username, email, password);
    if (result.success) {
      setUser(result.user);
      authStorage.currentUser = result.user;
    }
    return result;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============================================
// NAVBAR COMPONENT
// ============================================
const Navbar = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <button 
          onClick={() => onNavigate('home')}
          className="text-2xl font-bold hover:text-blue-200"
        >
          📚 Book Library
        </button>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button 
                onClick={() => onNavigate('favorites')}
                className="hover:text-blue-200"
              >
                ❤️ Favorites
              </button>
              <span className="text-sm">Hi, {user.username}!</span>
              <button 
                onClick={() => {
                  logout();
                  onNavigate('home');
                }}
                className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('login')}
                className="hover:text-blue-200"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// ============================================
// SEARCH BAR COMPONENT
// ============================================
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or keyword..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
        />
        <button 
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Search
        </button>
      </div>
    </div>
  );
};

// ============================================
// BOOK CARD COMPONENT
// ============================================
const BookCard = ({ book, onClick, showFavoriteButton = false }) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (user) {
      setIsFav(isFavorite(user.id, book.key));
    }
  }, [user, book.key]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to add favorites!');
      return;
    }
    
    if (isFav) {
      removeFromFavorites(user.id, book.key);
      setIsFav(false);
    } else {
      addToFavorites(user.id, book);
      setIsFav(true);
    }
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer bg-white relative"
    >
      {showFavoriteButton && user && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 text-2xl z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      )}
      <div onClick={onClick}>
        <img 
          src={getCoverUrl(book.cover_i)} 
          alt={book.title}
          className="w-full h-64 object-cover rounded mb-3"
        />
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-1">
          {book.author_name ? book.author_name.join(', ') : 'Unknown Author'}
        </p>
        <p className="text-gray-500 text-sm">
          {book.first_publish_year || 'Year unknown'}
        </p>
      </div>
    </div>
  );
};

// ============================================
// BOOK DETAILS MODAL
// ============================================
const BookDetailsModal = ({ book, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (user) {
      setIsFav(isFavorite(user.id, book.key));
    }
  }, [user, book.key]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getBookDetails(book.key);
        setDetails(data);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [book.key]);

  const handleFavoriteClick = () => {
    if (!user) {
      alert('Please login to add favorites!');
      return;
    }
    
    if (isFav) {
      removeFromFavorites(user.id, book.key);
      setIsFav(false);
    } else {
      addToFavorites(user.id, book);
      setIsFav(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold">{book.title}</h2>
            <button onClick={onClose} className="text-3xl hover:text-gray-600">&times;</button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <img 
                src={getCoverUrl(book.cover_i, 'L')} 
                alt={book.title}
                className="w-full rounded shadow-lg"
              />
              {user && (
                <button
                  onClick={handleFavoriteClick}
                  className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold"
                >
                  {isFav ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">Author(s)</h3>
                  <p className="text-gray-700">{book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
                </div>

                <div>
                  <h3 className="font-bold text-lg">First Published</h3>
                  <p className="text-gray-700">{book.first_publish_year || 'Unknown'}</p>
                </div>

                {book.publisher && (
                  <div>
                    <h3 className="font-bold text-lg">Publisher</h3>
                    <p className="text-gray-700">{book.publisher.slice(0, 3).join(', ')}</p>
                  </div>
                )}

                {book.isbn && (
                  <div>
                    <h3 className="font-bold text-lg">ISBN</h3>
                    <p className="text-gray-700">{book.isbn[0]}</p>
                  </div>
                )}

                {book.number_of_pages_median && (
                  <div>
                    <h3 className="font-bold text-lg">Pages</h3>
                    <p className="text-gray-700">{book.number_of_pages_median}</p>
                  </div>
                )}

                {book.subject && (
                  <div>
                    <h3 className="font-bold text-lg">Subjects</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {book.subject.slice(0, 10).map((subject, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {loading ? (
                  <p className="text-gray-500">Loading additional details...</p>
                ) : details?.description && (
                  <div>
                    <h3 className="font-bold text-lg">Description</h3>
                    <p className="text-gray-700">
                      {typeof details.description === 'string' 
                        ? details.description 
                        : details.description?.value || 'No description available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HOME PAGE
// ============================================
const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchBooks(query);
      setBooks(results);
      if (results.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Discover Your Next Great Read</h1>
      
      <SearchBar onSearch={handleSearch} />

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Searching for books...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          {error}
        </div>
      )}

      {!loading && books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book, idx) => (
            <BookCard 
              key={`${book.key}-${idx}`} 
              book={book} 
              onClick={() => setSelectedBook(book)}
              showFavoriteButton={true}
            />
          ))}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">Search for books to get started!</p>
        </div>
      )}

      {selectedBook && (
        <BookDetailsModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}
    </div>
  );
};

// ============================================
// LOGIN PAGE
// ============================================
const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = () => {
    setError('');
    
    const result = login(email, password);
    if (result.success) {
      onNavigate('home');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
          >
            Login
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={() => onNavigate('register')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

// ============================================
// REGISTER PAGE
// ============================================
const RegisterPage = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = () => {
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    const result = register(username, email, password);
    if (result.success) {
      onNavigate('home');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
          >
            Register
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => onNavigate('login')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

// ============================================
// FAVORITES PAGE
// ============================================
const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (user) {
      setFavorites(getFavorites(user.id));
    }
  }, [user]);

  const refreshFavorites = () => {
    if (user) {
      setFavorites(getFavorites(user.id));
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Please login to view favorites</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">My Favorite Books</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">You haven't added any favorites yet!</p>
          <p className="mt-2">Search for books and click the heart icon to add them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((book, idx) => (
            <div key={`${book.key}-${idx}`} className="relative">
              <BookCard 
                book={book} 
                onClick={() => setSelectedBook(book)}
                showFavoriteButton={false}
              />
              <button
                onClick={() => {
                  removeFromFavorites(user.id, book.key);
                  refreshFavorites();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <BookDetailsModal 
          book={selectedBook} 
          onClose={() => {
            setSelectedBook(null);
            refreshFavorites();
          }} 
        />
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'favorites':
        return <FavoritesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
        {renderPage()}
      </div>
    </AuthProvider>
  );
}