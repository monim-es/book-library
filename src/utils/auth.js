// Fake authentication using localStorage
export const registerUser = (username, email, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'User already exists' };
  }
  
  const newUser = { 
    id: Date.now(), 
    username, 
    email, 
    password 
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return { success: true, user: newUser };
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
  }
  
  return { success: false, message: 'Invalid email or password' };
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};