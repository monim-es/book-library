// Favorites management using localStorage
export const getFavorites = (userId) => {
  const key = `favorites_${userId}`;
  const favorites = localStorage.getItem(key);
  return favorites ? JSON.parse(favorites) : [];
};

export const addToFavorites = (userId, book) => {
  const favorites = getFavorites(userId);
  
  // Check if book already exists
  if (!favorites.find(b => b.key === book.key)) {
    favorites.push(book);
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
    return true;
  }
  
  return false;
};

export const removeFromFavorites = (userId, bookKey) => {
  let favorites = getFavorites(userId);
  favorites = favorites.filter(b => b.key !== bookKey);
  localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
};

export const isFavorite = (userId, bookKey) => {
  const favorites = getFavorites(userId);
  return favorites.some(b => b.key === bookKey);
};