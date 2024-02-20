const mysql = require('mysql')
const db = mysql.createConnection ({
    host : "localhost",
    user : "root",
    password: "",
    database : "dbapi"
})

module.exports = db