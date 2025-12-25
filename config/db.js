const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myapp"
});

db.connect(err => {
  if (err) {
    console.error("DB ERROR:", err);
  } else {
    console.log("DB CONNECTED");
  }
});

module.exports = db;
