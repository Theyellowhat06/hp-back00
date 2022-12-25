const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require('../db/index');
const ss = require('sqlstring');

const key = `mq0)l2t[8G}(=gvpOP$&oc'O,i_E^<`;

router.post('/rfid', (req, res) => {
    var body = req.body
    console.log(body)
    var stime = new Date(`${body.date} 08:00:00`)
    var etime = new Date(`${body.date} ${body.time}`)
    var dif = etime - stime
    var part_time = Math.floor(dif / 6000000)
    if(part_time >= 3){
        dif -= 1200000
        part_time = Math.floor(dif / 6000000)
    }
    const d = new Date(body.date);
    let day = d.getDay();
    console.log(`${dif} week_day: ${day},  part time: ${part_time + 1}`);
    var semester_week = getWeeksDiff(new Date(body.date));
    if(semester_week > 16) semester_week = 16
    const rows = new Promise((resolve, rejects) => {
        body.attendance.forEach((element, ind, array) => {
            var sql = `select id from users_pt where user_code = (select code_ from users where rfid = ${ss.escape(element.chip_number)}) and part_time_id = (select id from part_time where class_id = (select id from class where number_ = ${ss.escape(body.rfid_no)}) and week_day = ${day} and part_time = ${part_time + 1})`
            console.log(sql)
            con.query(sql, (err, result, fields) => {
                if(result.length > 0){
                    sql = `insert into week_pt(week_semester, users_pt_id, status_) values(${semester_week}, ${result[0].id}, 1)`;
                    console.log(sql)
                    con.query(sql, (err, result, fields) => {
                        if(err){
                            console.log(err)
                        }else{
                            if(ind === array.length - 1) resolve()
                        }
                        
                    })
                }else{
                    res.status(200).json({
                        success: true,
                        msg: 'RFID олдсонгүй'
                    })
                }
            })
        });
    })
    rows.then(() => {
        res.status(200).json({
            success: true,
        })
    })
    // // var sql = `select code_, fname, lname, permission from users where username = ${ss.escape(body.username)} and password = md5(${ss.escape(body.password)})`;
    //     console.log("query: "+sql)
    //     con.query(sql, (err, result, fields) => {
    //         if(err){
    //             res.json({
    //                 success: false,
    //                 msg: "Хэрэглэгчийн нэвтрэх нэр эсвэл нууц үг буруу байна"
    //             })
    //         }else{
    //             const token = jwt.sign({id: result[0].id, permission: result[0].permission}, key, {expiresIn: '30d'})
    //             res.json({
    //                 success: true,
    //                 result: result[0],
    //                 token: token
    //             })
    //         }
    //     })
})

function getWeeksDiff(endDate) {
    var startDate = new Date('2022-8-22')
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
  
    return Math.round(Math.abs(endDate - startDate) / msInWeek);
  }

module.exports = router