const { log } = require('console');
const { once } = require('events');
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
app.use(express.json());
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

const AlumnosSchema = mongoose.Schema({
    alumno : String,
    salon : String,
    sexo : String
});

const Usuario = mongoose.model("Usuario",UsuarioSchema);
const Alumnos = mongoose.model("Escuela",AlumnosSchema);

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

app.get("/getAlumnos", async (req,res)=>{
    try {
        const alumnos = await Alumnos.find();
        res.json(alumnos); 
    } catch (error) {
        console.error("Error al obtener los usuarios: " + error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}/`);
});



