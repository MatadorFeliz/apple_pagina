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

// --- Conexión a la Base de Datos (Aiven / Producción o Local) ---
// Si estás en Vercel, usarás variables de entorno; si estás en local, puedes poner tus credenciales de Aiven o XAMPP
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'TU_HOST_DE_AIVEN',
  user: process.env.DB_USER || 'TU_USUARIO_DE_AIVEN',
  password: process.env.DB_PASSWORD || 'TU_CONTRASENA_DE_AIVEN',
  database: process.env.DB_NAME || 'TU_BASE_DE_DATOS_DE_AIVEN',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false } // Requerido por Aiven para conexiones seguras
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
    if (err) return res.status(500).json({ error: err.message });
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

// Ruta comodín para SPA (Sirve el frontend correctamente en Vercel)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Iniciar Servidor / Exportar para Vercel ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;