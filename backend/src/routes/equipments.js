const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all equipments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM equipments ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar equipamentos' });
  }
});

// Get equipment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM equipments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar equipamento' });
  }
});

// Create equipment
router.post(
  '/',
  [
    body('serial_number').notEmpty(),
    body('model').notEmpty(),
    body('customer_name').notEmpty(),
    body('delivery_date').isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { serial_number, model, customer_name, customer_email, delivery_date, installation_address } = req.body;

      const result = await pool.query(
        'INSERT INTO equipments (serial_number, model, customer_name, customer_email, delivery_date, installation_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [serial_number, model, customer_name, customer_email, delivery_date, installation_address]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao criar equipamento' });
    }
  }
);

// Update equipment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { serial_number, model, customer_name, customer_email, installation_address } = req.body;

    const result = await pool.query(
      'UPDATE equipments SET serial_number = $1, model = $2, customer_name = $3, customer_email = $4, installation_address = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [serial_number, model, customer_name, customer_email, installation_address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM equipments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    res.json({ success: true, message: 'Equipamento deletado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar equipamento' });
  }
});

module.exports = router;