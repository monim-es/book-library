import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCoverUrl } from '../utils/api';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';

const BookCard = ({ book, onClick, showFavoriteButton = false }) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (user && book.key) {
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
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative group"
    >
      {/* Favorite Button */}
      {showFavoriteButton && user && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className="text-2xl">{isFav ? '❤️' : '🤍'}</span>
        </button>
      )}

      {/* Book Cover */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 bg-gray-100">
        <img 
          src={getCoverUrl(book.cover_i)} 
          alt={book.title || 'Book cover'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2 min-h-[3rem]">
          {book.title || 'Untitled'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-1 line-clamp-1">
          {book.author_name ? book.author_name.join(', ') : 'Unknown Author'}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-500 text-xs md:text-sm">
            {book.first_publish_year || 'Year unknown'}
          </p>
          
          {book.number_of_pages_median && (
            <p className="text-gray-500 text-xs md:text-sm">
              {book.number_of_pages_median} pages
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;