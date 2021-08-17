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

//Motor de Plantillas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//Middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

//Metodos de BD
app.use(require("./src/routes/realprestigeDB"));

//Vista Login
app.get("/CMS2/Login", (req, res) => {
  res.render("Login");
});

//Vista Agregar Casa
app.get("/CMS2/AgregarCasa", (req, res) => {
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
                    console.log(albumes, Nombre, calles);
                    res.render("AgregarCasa", {
                      data: albumes,
                      data2: Nombre,
                      data3: calles,
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
});

//Vista Agregar Album
app.get("/CMS2/AgregarAlbum", (req, res) => {
  res.render("AgregarAlbum");
});

//Vista Agregar Vendedor
app.get("/CMS2/AgregarVendedor", (req, res) => {
  res.render("AgregarVendedor");
});

//POST AGREGAR ALBUM
app.post("/CMS2/AgregarAlbum", upload.array("image", 20), (req, res) => {
  console.log(req.files);
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
  mysqlConnection.query(
    "INSERT INTO acmdsolu_RealPrestigeTest.Albumes set ?",
    [data],
    (err, rows) => {
      console.log(rows);
      res.render("AgregarAlbum");
    }
  );

  /* res.send(data); */
});

//POST AGREGAR VENDEDOR
app.post("/CMS2/AgregarVendedor", upload.single("image"), (req, res) => {
  console.log(req.files);

  /* res.send(req.body); */
  let { Nombre, Celular, Correo, Contraseña } = req.body;

  let data = {
    Nombre: Nombre,
    Celular: Celular,
    Correo: Correo,
    Contraseña: Contraseña,
    Foto: req.file.filename,
  };
  mysqlConnection.query(
    "INSERT INTO acmdsolu_RealPrestigeTest.Vendedores set ?",
    [data],
    (err, rows) => {
      console.log(rows);
      res.render("AgregarVendedor");
    }
  );

  /* res.send(data); */
});

//POST AGREGAR CASA
app.post("/CMS2/AgregarCasa", (req, res) => {
  console.log(req.body);
  data = req.body;
  mysqlConnection.query(
    "INSERT INTO acmdsolu_RealPrestigeTest.Casas set ?",
    [data],
    (err, rows) => {
      console.log(rows);
      res.render("AgregarCasa");
    }
  );

  /* res.json(req.body); */
});

//Corriendo El Server
app.listen(3000);
console.log("running on port 3000");
