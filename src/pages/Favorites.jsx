import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFromFavorites } from '../utils/favorites';
import BookCard from '../components/BookCard';
import BookDetails from '../components/BookDetails';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = () => {
    if (user) {
      const userFavorites = getFavorites(user.id);
      setFavorites(userFavorites);
    }
  };

  const handleRemoveFavorite = (bookKey) => {
    if (user) {
      removeFromFavorites(user.id, bookKey);
      loadFavorites();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl md:text-7xl mb-4">🔒</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Please Login
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            You need to be logged in to view your favorites
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 md:mb-4">
            ❤️ My Favorite Books
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600">
            Your personal collection of books you love
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-12 md:py-20 text-gray-500">
            <div className="text-6xl md:text-7xl mb-4">📚</div>
            <p className="text-xl md:text-2xl font-semibold mb-2">No favorites yet!</p>
            <p className="text-sm md:text-base">
              Search for books and click the heart icon to add them here
            </p>
          </div>
        ) : (
          <>
            {/* Favorites Count */}
            <div className="mb-6 text-center md:text-left">
              <p className="text-gray-600 text-sm md:text-base">
                You have <span className="font-bold text-blue-600">{favorites.length}</span> favorite book{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {favorites.map((book, idx) => (
                <div key={`${book.key}-${idx}`} className="relative group">
                  <BookCard 
                    book={book} 
                    onClick={() => setSelectedBook(book)}
                    showFavoriteButton={false}
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFavorite(book.key)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-10 opacity-0 group-hover:opacity-100"
                    aria-label="Remove from favorites"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Book Details Modal */}
        {selectedBook && (
          <BookDetails 
            book={selectedBook} 
            onClose={() => {
              setSelectedBook(null);
              loadFavorites(); // Refresh favorites after closing modal
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default Favorites;