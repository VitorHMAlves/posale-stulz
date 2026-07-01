const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all support tickets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e.serial_number, e.model, u.name as technician_name 
       FROM support_tickets t 
       LEFT JOIN equipments e ON t.equipment_id = e.id 
       LEFT JOIN users u ON t.technician_id = u.id 
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, e.serial_number, e.model, e.customer_name, u.name as technician_name 
       FROM support_tickets t 
       LEFT JOIN equipments e ON t.equipment_id = e.id 
       LEFT JOIN users u ON t.technician_id = u.id 
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar ticket' });
  }
});

// Create support ticket
router.post(
  '/',
  [
    body('equipment_id').isInt(),
    body('title').notEmpty(),
    body('description').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { equipment_id, title, description, priority } = req.body;

      const result = await pool.query(
        'INSERT INTO support_tickets (equipment_id, technician_id, title, description, priority, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [equipment_id, req.user.id, title, description, priority || 'medium', 'open']
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao criar ticket' });
    }
  }
);

// Update support ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, description } = req.body;

    const result = await pool.query(
      'UPDATE support_tickets SET status = $1, priority = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [status, priority, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar ticket' });
  }
});

// Close support ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE support_tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['closed', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    res.json({ success: true, message: 'Ticket fechado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fechar ticket' });
  }
});

module.exports = router;