const express = require("express");
const router = express.Router();
const mysqlConnection = require("../database");

//Obtener Calles
router.get("/getCalles", (req, res) => {
  mysqlConnection.query("select * from callesmazatlan", (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });
});

router.get("/Nombre", (req, res) => {
  mysqlConnection.query(
    "select NombreCalle from callesmazatlan",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    }
  );
});

//Obtener 6 Casas para Home
router.get("/6Casas", (req, res) => {
  mysqlConnection.query(
    "SELECT * FROM acmdsolu_RealPrestigeTest.Casas ORDER BY RAND() LIMIT 6;",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    }
  );
});

/* router.post("/TestFormulario", (req, res) => {
  const data = req.body;
  mysqlConnection.query(
    "INSERT INTO acmdsolu_RealPrestigeTest.callesmazatlan set ?",
    [data],
    (err, rows) => {
      console.log(rows);
      res.send("Calle Agregada");
    }
  );
}); */

module.exports = router;
