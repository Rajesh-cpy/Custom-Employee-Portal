export const setAuthSession = (token, user) => {
  localStorage.setItem('brainwave_token', token);
  localStorage.setItem('brainwave_user', JSON.stringify(user));
};

export const getAuthToken = () => {
  return localStorage.getItem('brainwave_token');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('brainwave_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem('brainwave_token');
  localStorage.removeItem('brainwave_user');
};

export const hasRole = (user, roleName) => {
  if (!user || !user.roles) return false;
  return user.roles.some(r => r.toLowerCase() === roleName.toLowerCase());
};

export const hasPermission = (user, permissionName) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permissionName);
};
