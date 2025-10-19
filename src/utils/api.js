// Open Library API functions
const BASE_URL = 'https://openlibrary.org';

export const searchBooks = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookDetails = async (workId) => {
  try {
    const response = await fetch(`${BASE_URL}${workId}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

export const getCoverUrl = (coverId, size = 'M') => {
  if (!coverId) {
    return 'https://via.placeholder.com/200x300?text=No+Cover';
  }
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};