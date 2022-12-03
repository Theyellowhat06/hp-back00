const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../db/index');
const ss = require('sqlstring');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post('/login', (req, res) => {
    var body = req.body
    console.log(body)
    var sql = `select code_, fname, lname, permission from users where username = ${ss.escape(body.username)} and password = md5(${ss.escape(body.password)})`;
        console.log("query: "+sql)
        con.query(sql, (err, result, fields) => {
            if(err){
                res.json({
                    success: false,
                    msg: "Хэрэглэгчийн нэвтрэх нэр эсвэл нууц үг буруу байна"
                })
            }else{
                const token = jwt.sign({id: result[0].id, permission: result[0].permission}, key, {expiresIn: '30d'})
                res.json({
                    success: true,
                    result: result[0],
                    token: token
                })
            }
        })
})

module.exports = router