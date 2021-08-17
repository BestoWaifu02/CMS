const mysql = require("mysql");
const mysqlConnection = mysql.createConnection({
  host: "72.52.148.204",
  user: "acmdsolu_Diego",
  password: "]z57Aq)L9yjQ",
  database: "acmdsolu_RealPrestigeTest",
});
/* Andree */
/* CoP}DzN4O{^y */

mysqlConnection.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Db is connected");
  }
});

module.exports = mysqlConnection;
