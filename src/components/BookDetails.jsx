import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookDetails, getCoverUrl } from '../utils/api';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';

const BookDetails = ({ book, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (user && book.key) {
      setIsFav(isFavorite(user.id, book.key));
    }
  }, [user, book.key]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getBookDetails(book.key);
        setDetails(data);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (book.key) {
      fetchDetails();
    }
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold pr-8">
              {book.title}
            </h2>
            <button 
              onClick={onClose}
              className="text-3xl md:text-4xl hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Book Cover & Actions */}
            <div className="md:col-span-1">
              <img 
                src={getCoverUrl(book.cover_i, 'L')} 
                alt={book.title}
                className="w-full rounded-lg shadow-lg mb-4"
              />
              
              {user && (
                <button
                  onClick={handleFavoriteClick}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isFav 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isFav ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
              )}
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <div className="space-y-4 md:space-y-6">
                {/* Author */}
                <div>
                  <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                    Author(s)
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base">
                    {book.author_name ? book.author_name.join(', ') : 'Unknown'}
                  </p>
                </div>

                {/* Published Year */}
                <div>
                  <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                    First Published
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base">
                    {book.first_publish_year || 'Unknown'}
                  </p>
                </div>

                {/* Publisher */}
                {book.publisher && book.publisher.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                      Publisher(s)
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      {book.publisher.slice(0, 3).join(', ')}
                    </p>
                  </div>
                )}

                {/* ISBN */}
                {book.isbn && book.isbn.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                      ISBN
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base font-mono">
                      {book.isbn[0]}
                    </p>
                  </div>
                )}

                {/* Pages */}
                {book.number_of_pages_median && (
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                      Number of Pages
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      {book.number_of_pages_median} pages
                    </p>
                  </div>
                )}

                {/* Subjects */}
                {book.subject && book.subject.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                      Subjects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {book.subject.slice(0, 15).map((subject, idx) => (
                        <span 
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs md:text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {loading ? (
                  <div className="text-gray-500 text-sm md:text-base">
                    Loading additional details...
                  </div>
                ) : details?.description && (
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
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

export default BookDetails;