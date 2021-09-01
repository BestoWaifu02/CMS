const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const mysqlConnection = require("./src/database");
const body_parser = require("body-parser");
//Codigo para subir foto
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../public_html/Images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    console.log(file.originalname);
  },
});
const upload = multer({ storage: storage });

//cors
var cors = require("cors");
app.use(cors());

//Motor de Plantillas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
/* app.use("/resources", express.static("public"));
 */ //app.use("/resources", express.static(__dirname + "/public"));
/* app.use(express.static(__dirname + "/public"));
 */
/* app.use("/static", express.static(__dirname + "/public"));
 */ app.use(express.static(path.join(__dirname, "public")));

//app.use(express.static("public"));

//Middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

//Proteccion de rutas
//Invocamos bcryptjs
const bcryptjs = require("bcryptjs");

//var de Sesiones
const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Metodos de BD
app.use(require("./src/routes/realprestigeDB"));

//Vista Login
app.get("/CMS2/Login", (req, res) => {
  res.render("Login");
});

// Autenticacion
app.post("/CMS2/Auth", async (req, res) => {
  const nombre = req.body.nombre;
  const password = req.body.password;
  let passwordHash = await bcryptjs.hash(password, 8);

  if (nombre && password) {
    mysqlConnection.query(
      "SELECT * FROM acmdsolu_RealPrestigeTest.Vendedores Where Nombre = ?",
      [nombre],
      async (error, results) => {
        console.log(results[0].Contraseña);
        if (
          //checar la encriptacion de bcryptjs
          /* results.length == 0 ||
          !(await bcryptjs.compare(password, results[0].Contraseña)) */
          !nombre == "manuel" &&
          !password == "123"
        ) {
          res.render("Login", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Usuario y/o Clave incorrectos",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: "CMS2/Login",
          });
        } else {
          req.session.name = results[0].name;
          req.session.loggedin = true;
          res.render("Login", {
            alert: true,
            alertTitle: "Conexion exitosa",
            alertMessage: "Datos Correctos",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: "CMS2/AgregarCasa",
          });
        }
      }
    );
  } else {
    res.render("Login", {
      alert: true,
      alertTitle: "Advertencia",
      alertMessage: "Favor de Ingresar Datos",
      alertIcon: "warning",
      showConfirmButton: true,
      timer: false,
      ruta: "CMS2/Login",
    });
  }
});

//Logout
app.get("/CMS2/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/CMS2/Login");
  });
});

//Vista Agregar Casa
app.get("/CMS2/AgregarCasa", (req, res) => {
  if (req.session.loggedin) {
    mysqlConnection.query(
      "SELECT NombreAlbum,idAlbum  from acmdsolu_RealPrestigeTest.Albumes ",
      (err, albumes) => {
        if (err) {
          res.json(err);
        } else {
          mysqlConnection.query(
            "SELECT Nombre,idVendedor from acmdsolu_RealPrestigeTest.Vendedores ",
            (err, Nombre) => {
              if (err) {
                res.json(err);
              } else {
                mysqlConnection.query(
                  "SELECT idCallesMazatlan,NombreCalle FROM acmdsolu_RealPrestigeTest.callesmazatlan",
                  (err, calles) => {
                    if (err) {
                      res.json(err);
                    } else {
                      mysqlConnection.query(
                        "SELECT * FROM (((Casas INNER JOIN Albumes ON Casas.AlbumFotos = Albumes.idAlbum)INNER JOIN Vendedores ON Casas.Vendedor = Vendedores.idVendedor)INNER JOIN callesmazatlan ON Casas.Ubicacion = callesmazatlan.idCallesMazatlan);",
                        (err, Casas) => {
                          if(err){
                            console.log(err)
                          }else{
                            console.log(Casas)
                             res.render("AgregarCasa", {
                              Casas: Casas,
                              data: albumes,
                              data2: Nombre,
                              data3: calles,
                              login: true,
                              name: req.session.name,
                            }); 
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } else {
    res.render("AgregarVendedor", {
      login: false,
      name: "Debes Iniciar Sesion",
    });
  }
});

//Vista Agregar Album
app.get("/CMS2/AgregarAlbum", (req, res) => {
  if (req.session.loggedin) {
    mysqlConnection.query(
      "SELECT * FROM acmdsolu_RealPrestigeTest.Albumes",
      (err, Albumes) => {
        if (err) {
          console.log(err);
        } else {
          res.render("AgregarAlbum", {
            login: true,
            name: req.session.name,
            Albumes: Albumes,
          });
        }
      }
    );
  } else {
    res.render("AgregarAlbum", {
      login: false,
      name: "Debes Iniciar Sesion",
    });
  }
});

//Vista Agregar Vendedor
app.get("/CMS2/AgregarVendedor", (req, res) => {
  /* res.render("AgregarVendedor"); */

  if (req.session.loggedin) {
    mysqlConnection.query(
      "SELECT * FROM acmdsolu_RealPrestigeTest.Vendedores",
      (err, vendedores) => {
        if (err) {
          console.log(err);
        } else {
          res.render("AgregarVendedor", {
            Vendedores: vendedores,
            login: true,
            name: req.session.name,
          });
        }
      }
    );
  } else {
    res.render("AgregarVendedor", {
      login: false,
      name: "Debes Iniciar Sesion",
    });
  }
});

//POST AGREGAR ALBUM
app.post("/CMS2/AgregarAlbum", upload.array("image", 20), (req, res) => {
  let { NombreAlbum } = req.body;
  const files = req.files;
  let data = {
    NombreAlbum: NombreAlbum,
    Foto1: files[0] ? files[0].filename : null,
    Foto2: files[1] ? files[1].filename : null,
    Foto3: files[2] ? files[2].filename : null,
    Foto4: files[3] ? files[3].filename : null,
    Foto5: files[4] ? files[4].filename : null,
    Foto6: files[5] ? files[5].filename : null,
    Foto7: files[6] ? files[6].filename : null,
    Foto8: files[7] ? files[7].filename : null,
    Foto9: files[8] ? files[8].filename : null,
    Foto10: files[9] ? files[9].filename : null,
    Foto11: files[10] ? files[10].filename : null,
    Foto12: files[11] ? files[11].filename : null,
    Foto13: files[12] ? files[12].filename : null,
    Foto14: files[13] ? files[13].filename : null,
    Foto15: files[14] ? files[14].filename : null,
    Foto16: files[15] ? files[15].filename : null,
    Foto17: files[16] ? files[16].filename : null,
    Foto18: files[17] ? files[17].filename : null,
    Foto19: files[18] ? files[18].filename : null,
    Foto20: files[19] ? files[19].filename : null,
  };

  if (req.session.loggedin) {
    mysqlConnection.query(
      "INSERT INTO acmdsolu_RealPrestigeTest.Albumes set ?",
      [data],
      (err) => {
        if (err) {
          console.log(err);
        } else {
          mysqlConnection.query(
            "SELECT * FROM acmdsolu_RealPrestigeTest.Albumes",
            (err, Albumes) => {
              res.render("AgregarAlbum", {
                login: true,
                Albumes: Albumes,
              });
            }
          );
        }
      }
    );
  } else {
    res.render("AgregarAlbum", {
      login: false,
      name: "Debes Iniciar Sesion",
    });
  }
});

//POST AGREGAR VENDEDOR
app.post("/CMS2/AgregarVendedor", upload.single("image"), async (req, res) => {
  let { Nombre, Celular, Correo, Contraseña } = req.body;
  let passwordHash = await bcryptjs.hash(Contraseña, 8);

  let data = {
    Nombre: Nombre,
    Celular: Celular,
    Correo: Correo,
    Contraseña: passwordHash,
    Foto: req.file.filename,
  };

  if (req.session.loggedin) {
    mysqlConnection.query(
      "INSERT INTO acmdsolu_RealPrestigeTest.Vendedores set ?",
      [data],
      (err) => {
        if (err) {
          console.log(err);
        } else {
          mysqlConnection.query(
            "SELECT * FROM acmdsolu_RealPrestigeTest.Vendedores",
            (err, vendedores) => {
              res.render("AgregarVendedor", {
                Vendedores: vendedores,
                login: true,
              });
            }
          );
        }
      }
    );
  } else {
    res.render("AgregarVendedor", {
      login: false,
      name: "Debes Iniciar Sesion",
    });
  }
});

//POST AGREGAR CASA
app.post("/CMS2/AgregarCasa", (req, res) => {
  data = req.body;
  if (req.session.loggedin) {
    mysqlConnection.query(
      "SELECT NombreAlbum,idAlbum  from acmdsolu_RealPrestigeTest.Albumes ",
      (err, albumes) => {
        if (err) {
          res.json(err);
        } else {
          mysqlConnection.query(
            "SELECT Nombre,idVendedor from acmdsolu_RealPrestigeTest.Vendedores",
            (err, Nombre) => {
              if (err) {
                res.json(err);
              } else {
                mysqlConnection.query(
                  "SELECT idCallesMazatlan,NombreCalle FROM acmdsolu_RealPrestigeTest.callesmazatlan",
                  (err, calles) => {
                    if (err) {
                      res.json(err);
                    } else {
                      mysqlConnection.query(
                        "INSERT INTO acmdsolu_RealPrestigeTest.Casas set ?",
                        [data],
                        (err) => {
                          if (err) {
                            console.log(err);
                          } else {
                            mysqlConnection.query(
                              "SELECT * FROM (((Casas INNER JOIN Albumes ON Casas.AlbumFotos = Albumes.idAlbum)INNER JOIN Vendedores ON Casas.Vendedor = Vendedores.idVendedor)INNER JOIN callesmazatlan ON Casas.Ubicacion = callesmazatlan.idCallesMazatlan);",
                              (err, Casas) => {
                                console.log(Casas)
                                 res.render("AgregarCasa", {
                                  
                                  login: true,
                                  Casas: Casas,
                                  data: albumes,
                                  data2: Nombre,
                                  data3: calles,
                                }); 
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } else {
    res.render("AgregarVendedor", {
      login: false,
      name: "Debes Iniciar Sesion",
    });
  }
 
});

//DeleteCasas
app.get("/CMS2/BorrarCasa/:id", (req, res) => {
  const { id } = req.params;
  mysqlConnection.query(
    "DELETE FROM acmdsolu_RealPrestigeTest.Casas WHERE AlbumFotos=?",
    [id],
    (err, Casas) => {
      if(err){
        console.log(err)
      }else{
        mysqlConnection.query("DELETE FROM acmdsolu_RealPrestigeTest.Albumes WHERE idAlbum=?",[id],(err,Albumes)=>{
          if(err){
            console.log(err)
            
          }else{
            res.redirect("/CMS2/AgregarCasa");
          }
        })
      }
    }
  );
});
//DeleteVendedores
app.get("/CMS2/BorrarVendedor/:id", (req, res) => {
  const { id } = req.params;
  mysqlConnection.query(
    "DELETE FROM acmdsolu_RealPrestigeTest.Vendedores WHERE idVendedor=?",
    [id],
    (err, Casas) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/CMS2/AgregarVendedor");
      }
    }
  );
});

//Endpoints
app.get("/CMS2/API/6Casas", (req, res) => {
  mysqlConnection.query(
    "SELECT *FROM ((Casas INNER JOIN Albumes ON Casas.AlbumFotos = Albumes.idAlbum)INNER JOIN Vendedores ON Casas.Vendedor = Vendedores.idVendedor);",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    }
  );
});

app.get("/CMS2/API/Casas", (req, res) => {
  mysqlConnection.query(
    "SELECT *FROM ((Casas INNER JOIN Albumes ON Casas.AlbumFotos = Albumes.idAlbum)INNER JOIN Vendedores ON Casas.Vendedor = Vendedores.idVendedor);",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    }
  );
});

app.get("/CMS2/API/Vendedores", (req, res) => {
  mysqlConnection.query(
    "SELECT idVendedor,Nombre,Celular,Correo,Foto FROM acmdsolu_RealPrestigeTest.Vendedores;",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    }
  );
});



//Corriendo El Server
app.listen(3000);
console.log("running on port 3000");
