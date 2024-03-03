const { log } = require('console');
const { once } = require('events');
const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;


mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect("mongodb://127.0.0.1:27017/escuela");
const db = mongoose.connection;

db.on("error",console.error.bind(console,"Error en la conexión a la base de datos"));
db.once("open",()=>{
    console.log("Conexión exitosa");
})

// Definir el Schema
const UsuarioSchema = mongoose.Schema({
    name : String,
    email : String,
    age : Number,
})

//Definimos el modelo
const Usuario = mongoose.model("Usuario",UsuarioSchema);

app.get("/", (req,res) => {
    res.send("Bienvenido a mi Servidor Web estoy aprendiendo xd");
})

app.get("/getUsuarios", async (req,res)=>{
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios); 
    } catch (error) {
        console.error("Error al obtener los usuarios: " + error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

app.post('/agregarUsuario',async (req,res)=>{
    try {
        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
        console.error('Error al crear un nuevo usuario:', error);
    }
});

app.put("/actualizarUsuario/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
    console.error("Error al actualizar usuario:", error);
  }
});

app.delete("/eliminarUsuario/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Usuario.findByIdAndDelete(id);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
        console.error("Error al eliminar usuario:", error);
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}/`);
});



