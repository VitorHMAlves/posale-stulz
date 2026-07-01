const jwt = require('jwt-simple');
const pool = require('../config/database');

const SECRET = process.env.JWT_SECRET || 'your_secret_key';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.decode(token, SECRET);
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const generateToken = (userId) => {
  return jwt.encode(
    { id: userId, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
    SECRET
  );
};

module.exports = { authMiddleware, generateToken };