const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Conexión a la Base de Datos (Aiven) ---
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL exitosamente.');
});

// --- API: Rutas CRUD ---

app.get('/api/productos', (req, res) => {
  const sql = 'SELECT * FROM productos ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Fallo DB: " + err.message, stack: err.stack });
    res.json(results);
  });
});

app.post('/api/productos', (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  const sql = 'INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, categoria, precio, stock], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto creado', id: result.insertId });
  });
});

app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;
  const sql = 'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?';
  db.query(sql, [nombre, categoria, precio, stock, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto actualizado' });
  });
});

app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto eliminado' });
  });
});

// Ruta SPA para el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar en local si no estamos en producción
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
}

// IMPORTANTE para Vercel
module.exports = app;