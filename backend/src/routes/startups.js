const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Setup multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Get all startups
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, e.serial_number, e.model, u.name as technician_name 
       FROM startups s 
       LEFT JOIN equipments e ON s.equipment_id = e.id 
       LEFT JOIN users u ON s.technician_id = u.id 
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar startups' });
  }
});

// Get startup by ID with images
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const startup = await pool.query(
      `SELECT s.*, e.serial_number, e.model, e.customer_name, u.name as technician_name 
       FROM startups s 
       LEFT JOIN equipments e ON s.equipment_id = e.id 
       LEFT JOIN users u ON s.technician_id = u.id 
       WHERE s.id = $1`,
      [id]
    );

    if (startup.rows.length === 0) {
      return res.status(404).json({ error: 'Startup não encontrado' });
    }

    const images = await pool.query(
      'SELECT * FROM images WHERE startup_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...startup.rows[0],
        images: images.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar startup' });
  }
});

// Create startup
router.post(
  '/',
  [
    body('equipment_id').isInt(),
    body('startup_date').isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { equipment_id, startup_date, observations } = req.body;

      const result = await pool.query(
        'INSERT INTO startups (equipment_id, technician_id, startup_date, observations, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [equipment_id, req.user.id, startup_date, observations, 'completed']
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao criar startup' });
    }
  }
);

// Upload images
router.post('/:id/images', upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
    }

    const images = [];
    for (const file of req.files) {
      const result = await pool.query(
        'INSERT INTO images (startup_id, file_path, file_name) VALUES ($1, $2, $3) RETURNING *',
        [id, `/uploads/${file.filename}`, file.originalname]
      );
      images.push(result.rows[0]);
    }

    res.status(201).json({ success: true, data: images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer upload de imagens' });
  }
});

// Update startup
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observations } = req.body;

    const result = await pool.query(
      'UPDATE startups SET status = $1, observations = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status || 'completed', observations, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Startup não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar startup' });
  }
});

module.exports = router;