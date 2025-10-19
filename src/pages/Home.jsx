import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import BookDetails from '../components/BookDetails';
import { searchBooks } from '../utils/api';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const results = await searchBooks(query);
      setBooks(results);
      
      if (results.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to fetch books. Please check your connection and try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 md:mb-4">
            Discover Your Next Great Read
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Search through millions of books and find your next favorite
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 md:py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-sm md:text-base">Searching for books...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
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

        {/* Empty State */}
        {!loading && !error && books.length === 0 && hasSearched && (
          <div className="text-center py-12 md:py-20 text-gray-500">
            <div className="text-5xl md:text-6xl mb-4">📚</div>
            <p className="text-lg md:text-xl">No books found</p>
            <p className="text-sm md:text-base mt-2">Try searching with different keywords</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <div className="text-center py-12 md:py-20 text-gray-500">
            <div className="text-6xl md:text-7xl mb-4">📖</div>
            <p className="text-xl md:text-2xl font-semibold mb-2">Start Your Search</p>
            <p className="text-sm md:text-base">Enter a book title, author, or keyword to begin</p>
          </div>
        )}

        {/* Book Details Modal */}
        {selectedBook && (
          <BookDetails 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default Home;