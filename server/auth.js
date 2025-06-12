const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const saltRounds = 10;

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const createUser = (username, password, displayName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      db.run(
        'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
        [username, hashedPassword, displayName],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, username, display_name: displayName });
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

const authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          reject(err);
        } else if (!user) {
          reject(new Error('User not found'));
        } else {
          try {
            const isValidPassword = await comparePassword(password, user.password_hash);
            if (isValidPassword) {
              const token = generateToken(user);
              resolve({ user: { id: user.id, username: user.username, display_name: user.display_name }, token });
            } else {
              reject(new Error('Invalid password'));
            }
          } catch (error) {
            reject(error);
          }
        }
      }
    );
  });
};

module.exports = {
  authMiddleware,
  createUser,
  authenticateUser,
  hashPassword,
  comparePassword
};