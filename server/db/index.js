var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "hp",
  password: "hp@)@@",
  database: "hp"
});
con.connect((error) => {
    if(error){
        console.log(error)
    }else{
        console.log("db connected successfully")
    }
})
module.exports = con;