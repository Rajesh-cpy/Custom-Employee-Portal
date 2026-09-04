function validateLogin(req, res, next) {
  const { username, password } = req.body || {};

  const hasUsername = username !== undefined && username !== null && String(username).trim() !== '';
  const hasPassword = password !== undefined && password !== null && String(password).trim() !== '';

  if (!hasUsername && !hasPassword) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  if (!hasUsername) {
    return res.status(400).json({
      success: false,
      error: 'Username is required'
    });
  }

  if (!hasPassword) {
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }

  next();
}

function validateCreateUser(req, res, next) {
  const { username, email, password, name, role } = req.body || {};

  if (!username || !String(username).trim()) {
    return res.status(400).json({ success: false, error: 'Username is required' });
  }

  if (!email || !String(email).trim()) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  if (!password || !String(password).trim()) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required' });
  }

  if (!role || !String(role).trim()) {
    return res.status(400).json({ success: false, error: 'Role is required' });
  }

  next();
}

function validateUpdateUser(req, res, next) {
  const { email, name } = req.body || {};

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
  }

  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ success: false, error: 'Full name cannot be empty' });
  }

  next();
}

module.exports = {
  validateLogin,
  validateCreateUser,
  validateUpdateUser
};
