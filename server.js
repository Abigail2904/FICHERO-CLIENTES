const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.ENV') });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// A veces el host (p. ej. Render) puede devolver un MIME incorrecto para CSS.
// Forzamos la respuesta con el tipo correcto para evitar "strict MIME checking".
app.get('/styles.css', (req, res) => {
  res.type('text/css');
  res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/clientela';
const dbName = process.env.MONGO_DB_NAME || 'clientela';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName
})
  .then(() => console.log(`MongoDB conectado a la base '${dbName}'`))
  .catch(err => {
    console.error('Error MongoDB:', err.message);
    console.error('Verifica la variable MONGO_URI o MONGO_URI_TEST en el archivo .ENV');
  });

// Rutas API
const clientsRouter = require('./routes/clients');
app.use('/api/clients', clientsRouter);

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));
// Servir carpeta IMG para usar imágenes de fondo/logo desde /IMG
app.use('/IMG', express.static(path.join(__dirname, 'IMG')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
