const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
var cors = require('cors');

const app = express();
const port = 3000;
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "TMCBD",
};

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.use(bodyParser.json());
app.use(cors());
const connection = mysql.createConnection(dbConfig);

connection.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
  } else {
    console.log("Conexión exitosa a la base de datos");
  }
});

app.get("/", (req,res) => {
    res.send("Bienvenido a mi Servidor Web estoy aprendiendo xd");
})

app.get("/usuarios", (req, res) => {
  connection.query("SELECT * FROM usuarios", (error, resultados) => {
    if (error) {
      console.error("Error al realizar la consulta:", error);
      res.status(500).send("Error en el servidor");
    } else {
        console.log(resultados);
        let table = "<table>";
        let style = `
          <style>
          body {
            background-color: #f2f2f2;
            font-family: Arial, sans-serif;
          }
          table {
              margin: 0 auto;
              border-collapse: collapse;
              width: 70%;
              box-shadow: 2px 2px 12px 1px rgba(0,0,0,0.2); 
          }
          th, td {
              border: 1px solid black;
              padding: 8px; 
              text-align: center;
          }
          th {
              background-color: #4CAF50;
              color: white;
          }
          tr:nth-child(even) {
              background-color: #f2f2f2;
          }
          tr:hover {
              background-color: #ddd;
          }
          </style>
        `;
        for(let i=0; i<resultados.length; i++) {
            const usuario = resultados[i];
            if(i === 0){
                table += "<tr>";
                for(let key in usuario){
                    table += `<th>${key}</th>`;
                }
                table += "</tr>";  
            }
            table += "<tr>";
            for(let key in usuario){
                table += `<td>${usuario[key]}</td>`;
            }
            table += "</tr>";
        }
        table += "</table>";
        res.send(style + table);

        // res.json(resultados);
    }
  });
});

app.get(
  "/getUsers",
  (req,res)=>{
    connection.query(
      "SELECT * FROM usuarios",
      (err,rows)=>{
        if(err) res.status(500).send("Error en el servidor");
        res.json(rows);
      }
    );
  }
);

app.post('/insert_user', (req, res) => {
  const newUser = req.body;

  if (!newUser) {
    return res.status(400).json({ error: 'Datos de usuario no proporcionados en el cuerpo de la solicitud.' });
  }

  connection.query('INSERT INTO usuarios (name, username, email, password) VALUES (?, ?, ?, ?)',
    [newUser.name, newUser.username, newUser.email, newUser.password],
    (error, resultado) => {
      if (error) {
        console.error('Error al insertar el usuario:', error);
        res.status(500).send('Error en el servidor');
      } else {
        console.log('Usuario insertado con éxito');
        res.status(201).json(resultado);
      }
    } 
  );
});

// app.post('/usuarios', (req, res) => {
//   let user = req.body;
//   var sql = 'INSERT INTO usuarios SET ?';
//   connection.query(sql, user, (error, results) => {
//       if (error) {
//           throw error;
//       }
//       res.send("Usuario añadido con éxito");
//   });
// });

app.delete("/eliminarUsuario/:id",(req,res) => {
  let id = req.params.id;

  connection.query(
    "DELETE FROM usuarios WHERE id =?",id,
    (err,resultado) => {
      if (err) {
        console.error('Error al eliminar un egistro en la base de datos',err);
        res.status(500).send("Error en el servidor");
      }else{
        console.log(resultado);
        if (resultado.affectedRows === 0 ) {
          res.status(400).send("No se puede eliminar un registro con el id 0");
        }else{
          res.status(200).send("Se ha eliminado correctamente el registro: " + id);
        }
      }
    }
  );
});

app.put("/editarUsuario",(req,res) => {

  let data = req.body;
  let id = data.id;
  let datos = {
    name: data.name,
    username:data.username,
    email:data.username
  }
  console.log(data);

  // connection.query(
  //   "UPDATE usuarios SET name = ?, username = ? , email = ?  WHERE id =?",
  //   [data.name,data.username,data.email,data.id],
  //   (err,response) => {
  //     if (err){
  //       res.status(500).send(`Error al actualizar el usuario : ${data.id}`,response ); 
  //     }else{
  //       res.status(200).send(`Usuario ${data.id} actualizado correctamente`);
  //     }
  //   }
  // );

  connection.query(
    "UPDATE usuarios SET ? WHERE id = ?",
    [datos,id],
    (err,response) => {
      if (err){
        res.status(500).send(`Error al actualizar el usuario : ${id}`,response ); 
      }else{
        res.status(200).send(`Usuario ${id} actualizado correctamente`);
      }
    }
  );
});

app.post(
  "/login",
  (req,res)=>{
    let {email,password} = req.body;
    console.log(req.body);
    connection.query(
      "SELECT username FROM usuarios WHERE email = ? AND password = ?",
      [email,password],
      (err,row) =>{
        if (err) throw err;
        
        if (row.length > 0) {
          res.send({ success: true, message: 'Login successful', user: row[0] });
        } else {
          res.send({ success: false, message: 'Login failed' });
        }
      }
    );
  }
)
