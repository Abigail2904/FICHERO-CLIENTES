const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  description: { type: String, default: '' },
  // Arreglo de fechas (YYYY-MM-DD) en las que la clienta está programada
  scheduledDates: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', ClientSchema);
