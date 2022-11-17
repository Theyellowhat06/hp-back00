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

const key = 'MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2'

const query = util.promisify(con.query).bind(con);

router.get('/info', (req, res) => {
    try{
        var data = [];
        var sql = `select code_, fname, lname from users where is_teacher = 1`;
        con.query(sql, (err, rs, fields) => {
            data = rs;
            if(data.length > 0){
                res.status(200).json({
                    success: true,
                    data: data
                })
            }
        })
    }catch(e){
        console.error(e)
        res.status(401).json({
            success: false,
            msg: "Permission denied"
        })
    }
});

router.get('/schedule', (req, res) => {
    try{
        var data = [];
        for(let day = 1; day <= 7; day++){
                
            var sql = `select name_, subject_code, (select number_ from class where id = class_id) as class_number, part_time, if(type_ = 1, 'Лекц', 'Лаб') as type_ 
            from users_pt as up cross join part_time as pt cross join subjects as s 
            where up.part_time_id = pt.id and pt.subject_code = s.code_ and up.user_code = '${req.query.teacher_id}' and pt.part_time = ${day};`
            con.query(sql, (err, rs, fields) => {
                var subjects = [];
                const rows = new Promise((resolve, rejects) => {
                    rs.forEach((element, ind, array)=>{
                        subjects.push({
                            code: element.subject_code,
                            name: element.name_,
                            class_type: element.type_,
                            part_time: element.part_time,
                        });
                        if(ind === array.length - 1) resolve()
                    });
                })
                rows.then(() => {
                    data.push({
                        weekday: day,
                        Subjects: subjects
                    });
                    if(day > 7) {  
                        res.status(200).json({
                            success: true,
                            data: data
                        })
                    }
                })
                if(day >= 7){
                    res.status(200).json({
                        success: true,
                        data: data
                    })
                }
            })
        }
    }catch(e){
        console.error(e)
        res.status(401).json({
            success: false,
            msg: "Permission denied"
        })
    }
})

module.exports = router