const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');


require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;


mongoose.connect(process.env.MONGODB_URI2);

const db = mongoose.connection;

db.on("error",console.error.bind(console,"Error en la conexión a la base de datos"));
db.once("open",()=>{
    console.log("Conexión exitosa");
});

let caliSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Usuario',
        required: [true,'El id del usuario es requerido']
    },
    materiaId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Materia',
        required: [true,'El id de la materia es requerido']
    },
    calificacion:{
        type: Number,
        required: [true,'La calificación es requerida']
    }
});


let usuarioSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: [true,'El nombre es requerido']
    },
    correo:{
        type: String,
        required: [true,'El correo es requerido']
    },
    contraseña:{
        type: String,
        required: [true,'La contraseña es requerida']
    },
    grado:{
        type: Number,
        required: [true,'El grado es requerido']
    }

});
let materiaSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: [true,'El nombre es requerido']
    },
});

const Calificacion = mongoose.model('Calificaciones',caliSchema);
const Usuario = mongoose.model('Usuarios',usuarioSchema);
const Materia = mongoose.model('Materias',materiaSchema);

// obtener Usuarios

app.get(
    "/getUsuarios",
    async (req,res)=>{
        try {
            let usuarios = await Usuario.find();
            res.json(usuarios);
        } catch (error) {
            console.error(error);
            res.status(500).send({
                estatus : "Error",
                message: error.message
            });
        }
    }
);

//agregar usuario
app.post(
    "/addUsuario",
    async(req,res)=>{
        try {
            const newUsuario = new Usuario(req.body);
            await newUsuario.save();
            res.json(newUsuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
);

//Actualizar Usuario
app.put(
    "/updateUsuario/:id",
    async(req,res)=>{
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByIdAndUpdate
            (id,req.body,{new:true});
            res.json(usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
);

//Eliminar Usuario
app.delete(
    "/deleteUsuario/:id",
    async(req,res)=>{
        try {
            const { id } = req.params;
            await Usuario.findByIdAndDelete(id);
            res.json({message: "Usuario eliminado"});
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
);

//Obtener Materias
app.get(
    "/getMaterias",
    async (req,res)=>{
        try {
            let materias = await Materia.find();
            res.json(materias);
        } catch (error) {
            console.error(error);
            res.status(500).send({
                estatus : "Error",
                message: error.message
            });
        }
    }
);

//Agregar Materia
app.post(
    "/addMateria",
    async(req,res)=>{
        try {
            const newMateria = new Materia(req.body);
            await newMateria.save();
            res.json(newMateria);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
);

//Actualizar Materia
app.put(
    "/updateMateria/:id",
    async(req,res)=>{
        try {
            const { id } = req.params;
            const materia = await Materia.findByIdAndUpdate
            (id,req.body,{new:true});
            res.json(materia);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
);

//Eliminar Materia
app.delete(
    "/deleteMateria/:id",
    async(req,res)=>{
        try {
            const { id } = req.params;
            await Materia.findByIdAndDelete(id);
            res.json({message: "Materia eliminada"});
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
);



//ObtenerCalificaciones
app.get(
    "/getCalificaciones",
    async (req,res)=>{
        try {
            //obtener todas las calificaciones
            let calificaciones = await Calificacion.find();

            if (calificaciones == null) {
                return(
                    res.json({
                        status: "Error",
                        message: "No hay calificaciones"
                    })
                );
            }

            // creamos una nueva lista de calificaciones
            let newCalificaciones = await Promise.all(
                //mapeamos la lista de calificaciones
                calificaciones.map(async (calificacion) => {
                    //obtenemos la info del usuario
                    let infoUser = await Usuario.findById(calificacion.userId);

                    //obtenemos el nombre de la materia
                    let infoMateria = await Materia.findById(calificacion.materiaId);

                    // devolvemos un nuevo objeto con la info del usuario y la calificacion
                    if (infoUser == null || infoMateria == null) {
                        return {
                            status: "Error",
                            usuario: "Usuario no encontrado",
                            materia: "Materia no encontrada",
                        };

                    }else{
                        return {
                            usuario: infoUser.nombre,
                            materia: infoMateria.nombre,
                            calificacion: calificacion.calificacion,
                        };
                    }
                })
            )

            res.json(newCalificaciones);

        } catch (error) {
            console.error(error);
            res.status(500).send({
                estatus : "Error",
                message: error.message
            });
        }
    }
);

//obtener calificaciones por usuario
app.get(
    "/getCalificaciones/:id",
    async(req,res)=>{
        try {
            let calificaciones = await Calificacion.find({userId:req.params.id});
            let usuario = await Usuario.findById(req.params.id);

            if (calificaciones != null && usuario != null) {
                
                let userCalificaciones = await Promise.all(
                    calificaciones.map(async (calificacion)=>{
                        let materias = await Materia.findById(calificacion.materiaId);

                        if (usuario == null || materias == null) {
                            return {
                                status: "Error",
                                materia: "Materia no encontrada",
                            };

                        }else{
                            return {
                                // usuario: usuario.nombre,
                                materia: materias.nombre,
                                calificacion: calificacion.calificacion,
                            };
                            
                        }
                    })
                )

                res.json({
                    status : "Ok",
                    usuario: usuario.nombre,
                    calificaciones : userCalificaciones
                });
            }else{
                res.json({
                    status: "Error",
                    usuario: "usuario no encontrado",
                    calificaciones : "calificaciones no encontradas"
                })
            }



        } catch (error) {
            console.error(error);
            res.status(500).send({
                estatus : "Error",
                message: error.message
            });
        }
    }
)

//Agregar Calificación
app.post(
    "/addCalificacion",
    async(req,res)=>{
        try {

            const newCalificaion = new Calificacion(req.body);
            await newCalificaion.save();
            res.json(newCalificaion);

        } catch (error) {

            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message

            });
        }
    }
)

//Actualizar Calificación
app.put(
    "/updateCalificacion/:id",
    async(req,res)=>{
        try {

            const { id } = req.params;
            const calificacion = await Calificacion.findByIdAndUpdate(id,req.body,{new:true});
            res.json(calificacion);

        } catch (error) {

            console.error(error);
            res.status(500).json({
                status: 'Error interno del servidor',
                error : error.message
            });
        }
    }
)

//Eliminar Calificación
app.delete(
    "/deleteCalificacion/:id",
    async(req,res)=>{
        try {

            const { id } = req.params;
            await Calificacion.findByIdAndDelete(id);
            res.json({message: "Calificación eliminada"});

        } catch (error) {
                
                console.error(error);
                res.status(500).json({
                    status: 'Error interno del servidor',
                    error : error.message
                });
            }
    }
)


app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}/`);
});



