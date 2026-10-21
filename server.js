const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json()); // Permite al servidor entender formato JSON
app.use(express.static('public')); // Servirá los archivos de la carpeta 'public' (nuestro frontend)

// --- Conexión a la Base de Datos (XAMPP) ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Usuario por defecto en XAMPP
  password: '',      // Contraseña por defecto vacía en XAMPP
  database: 'inventario_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL (inventario_db) exitosamente.');
});

// --- API: Rutas CRUD ---

// 1. LEER (Obtener todos los productos)
app.get('/api/productos', (req, res) => {
  const sql = 'SELECT * FROM productos ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. CREAR (Insertar un nuevo producto)
app.post('/api/productos', (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  const sql = 'INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, categoria, precio, stock], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto creado', id: result.insertId });
  });
});

// 3. ACTUALIZAR (Modificar un producto por su ID)
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;
  const sql = 'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?';
  db.query(sql, [nombre, categoria, precio, stock, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto actualizado' });
  });
});

// 4. ELIMINAR (Borrar un producto por su ID)
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto eliminado' });
  });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});