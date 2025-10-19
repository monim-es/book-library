import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl md:text-2xl font-bold hover:text-blue-200 transition-colors"
          >
            <span>📚</span>
            <span className="hidden sm:inline">Book Library</span>
            <span className="sm:hidden">Books</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                <Link 
                  to="/favorites" 
                  className="flex items-center space-x-1 hover:text-blue-200 transition-colors px-2 md:px-3 py-2"
                >
                  <span>❤️</span>
                  <span className="hidden sm:inline">Favorites</span>
                </Link>
                
                <span className="hidden md:inline text-sm text-blue-100">
                  Hi, {user.username}!
                </span>
                
                <button 
                  onClick={logout}
                  className="bg-blue-800 hover:bg-blue-900 px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-sm md:text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-blue-200 transition-colors px-3 py-2 text-sm md:text-base"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-800 hover:bg-blue-900 px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-sm md:text-base"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;