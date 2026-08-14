const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// GET /api/clients?search=&sort=asc
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const trimmed = search.trim();

    if (!trimmed) {
      const clients = await Client.find({}).sort({ lastName: 1, firstName: 1 });
      return res.json(clients);
    }

    const terms = trimmed.split(/\s+/).filter(Boolean);
    const regexes = terms.map(term => new RegExp(term, 'i'));

    const clients = await Client.find({
      $or: [
        { firstName: { $in: regexes } },
        { lastName: { $in: regexes } },
        { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: trimmed, options: 'i' } } },
        { $expr: { $regexMatch: { input: { $concat: ['$lastName', ' ', '$firstName'] }, regex: trimmed, options: 'i' } } }
      ]
    }).sort({ lastName: 1, firstName: 1 });

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET scheduled for a specific date: /api/clients/scheduled?date=YYYY-MM-DD
router.get('/scheduled', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Se requiere fecha' });
    const clients = await Client.find({ scheduledDates: date }).sort({ lastName: 1, firstName: 1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'No encontrado' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, description } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
    }
    const client = new Client({ firstName, lastName, description });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error('Error al crear cliente:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST schedule a client for a date (body: { date: 'YYYY-MM-DD' })
router.post('/:id/schedule', async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Se requiere fecha' });
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'No encontrado' });
    if (!client.scheduledDates.includes(date)) {
      client.scheduledDates.push(date);
      await client.save();
    }
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, description } = req.body;
    const client = await Client.findByIdAndUpdate(req.params.id, { firstName, lastName, description }, { new: true });
    if (!client) return res.status(404).json({ error: 'No encontrado' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE remove scheduled date from client: /api/clients/:id/schedule?date=YYYY-MM-DD
router.delete('/:id/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Se requiere fecha' });
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'No encontrado' });
    client.scheduledDates = client.scheduledDates.filter(d => d !== date);
    await client.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
