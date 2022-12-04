const express = require('express');
const router = express.Router();
const con = require('../db/index');
const ss = require('sqlstring');
const jwt = require('jsonwebtoken');
const util = require('util');
const e = require('express');
// const { decode } = require('jsonwebtoken');
// const async = require('hbs/lib/async');
// const { resolve } = require('path');
// const { rejects } = require('assert');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

const query = util.promisify(con.query).bind(con);

router.get('/students-list', (req, res) => {
    try{
        var data = [];
        var sql = `select * from users where permission = 4`;
        con.query(sql, (err, rs, fields) => {
            const rows = new Promise((resolve, rejects) => {
                rs.forEach((element, ind, array)=>{
                    data.push({
                        student_id: element.code_,
                        student_lname: element.lname,
                        student_fname: element.fname,
                        chip_number: element.rfid
                    })
                    if(ind === array.length - 1) resolve()
                })
            })
            rows.then(() => {
                res.status(200).json({
                    success: true,
                    data: data
                })
            })
        })
    }catch(e){
        console.error(e)
        res.json({
            success: false,
            msg: "Permission denied"
        })
    }
});

router.post('/insert-student-chip-number', (req, res) => {
    try{
        console.log(req.body)
        var sql = `update users set rfid = ${ss.escape(req.body.chip_number+'')} where code_ = ${ss.escape(req.body.student_id)}`;
        console.log(sql)
        con.query(sql, (err, rs, fields) => {
            if(err){
                res.status(200).json({
                    success: false,
                    msg: 'Алдаа гарлаа'
                })
            }else{
                res.status(200).json({
                    success: true,
                    msg: 'Амжилттай өөрчиллөө'
                })
            }
        })
    }catch(e){
        console.error(e)
        res.json({
            success: false,
            msg: "Permission denied"
        })
    }
});



module.exports = router