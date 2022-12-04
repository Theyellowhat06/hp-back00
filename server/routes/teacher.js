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
        res.json({
            success: false,
            msg: "Permission denied"
        })
    }
});

router.get('/schedule', (req, res) => {
    if(!('authorization' in req.headers)){
        res.json({
            success: false,
            msg: "Хандах эрхгүй байна"
        })
    }else{
        try{
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, key)
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
                                class_number: element.class_number
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
            res.json({
                success: false,
                msg: "Хандах эрхгүй байна"
            })
        }
    }
    
})

router.get('/classes', (req, res) => {
    if(!('authorization' in req.headers)){
        res.json({
            success: false,
            msg: "Хандах эрхгүй байна"
        })
    }else{
        try{
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, key)
            var sql = `select distinct subject_code, (select name_ from subjects where code_ = p.subject_code) as subject_name from part_time p cross join users_pt u where u.part_time_id = p.id and u.user_code = '${req.query.teacher_id}';`
            con.query(sql, (err, rs, fields) => {
                //console.log(rs)
                var subjects = [];
                const rows = new Promise((resolve, rejects) => {
                    rs.forEach((element, ind, array)=>{
                        sql = `select *, (select name_ from subjects where code_ = p.subject_code) as subject_name from part_time p cross join users_pt u where u.part_time_id = p.id and u.user_code = '${req.query.teacher_id}' and subject_code = '${element.subject_code}';`
                        
                        con.query(sql, (err, rs, fields) => {
                            var lecture = []
                            var seminar = []
                            var laborator = []
                            const inrows = new Promise((resolve, rejects) => {
                                rs.forEach((element, ind, array)=>{
                                    if(element.type_ == 1) lecture.push(`${element.week_day}-${element.part_time}`)
                                    else if(element.type_ == 2) laborator.push(`${element.week_day}-${element.part_time}`)
                                    else if(element.type_ == 3) seminar.push(`${element.week_day}-${element.part_time}`)
                                    if(ind === array.length - 1) resolve()
                                })
                            })
                            inrows.then(()=>{
                                subjects.push({
                                    id: element.subject_code,
                                    name: element.subject_name,
                                    lecture: lecture,
                                    seminar: seminar,
                                    laborator: laborator,
                                });
                            })
                            if(ind === array.length - 1) resolve()
                        })
                        
                        
                    });
                })
                rows.then(() => {
                    res.status(200).json({
                        success: true,
                        data: subjects
                    })
                })
            })
        }catch(e){
            console.error(e)
            res.status(401).json({
                success: false,
                msg: "Permission denied"
            })
        }
    }
})

router.get('/class-attendance', (req, res) => {
    if(!('authorization' in req.headers)){
        res.json({
            success: false,
            msg: "Хандах эрхгүй байна"
        })
    }else{
        try{
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, key)
            var sql = `SELECT 
            *,
            DATE_FORMAT((SELECT 
                    created_at
                FROM
                    attendance a
                WHERE
                    a.user_code = u.code_
                        AND a.week_day = pt.week_day
                        AND a.part_time = pt.part_time
                        AND semester_week = ${ss.escape(req.query.semester_week)}
                ORDER BY created_at DESC
                LIMIT 1), '%H:%i:%s') AS created_at
        FROM
            part_time pt
                CROSS JOIN
            users_pt upt
                CROSS JOIN
            users u
        WHERE
            pt.id = upt.part_time_id
                AND upt.user_code = u.code_
                AND pt.subject_code = ${ss.escape(req.query.subject_id)}
                AND pt.week_day = ${ss.escape(req.query.week_day)}
                AND pt.part_time = ${ss.escape(req.query.part_time)}
                AND u.permission = 4
                AND pt.class_id = (SELECT 
                    class_id
                FROM
                    part_time ipt
                        CROSS JOIN
                    users_pt iupt
                WHERE
                    ipt.id = iupt.part_time_id
                        AND ipt.week_day = pt.week_day
                        AND ipt.part_time = pt.part_time
                        AND iupt.user_code = ${ss.escape(req.query.teacher_id)});`
            con.query(sql, (err, rs, fields) => {
                var attendance = [];
                var total_students = rs.length
                var total_absent = 0
                var total_present = 0
                var total_sick = 0
                var total_free = 0
                rs.forEach((element) =>{
                    if(element.created_at == null){
                        var stts = 0
                        if(element.status_ != null){
                            stts = element.status
                        }
                        if(stts == 0) total_absent++;
                        if(stts == 1) total_present++;
                        if(stts == 2) total_sick++;
                        if(stts == 3) total_free++;
                        attendance.push({
                            student_id: element.user_code,
                            student_lname: element.lname,
                            student_fname: element.fname,
                            status: stts,
                            time: element.created_at,
                            updated_at: "19:20:45"
                        })
                    }else{
                        total_present++;
                        attendance.push({
                            student_id: element.user_code,
                            student_lname: element.lname,
                            student_fname: element.fname,
                            status: 1,
                            time: element.created_at,
                            updated_at: ""
                        })
                    }
                })

                res.status(200).json({
                        success: true,
                        data: {
                            total_students: total_students,
                            total_absent: total_absent,
                            total_present: total_present,
                            total_sick: total_sick,
                            total_free: total_free,
                            attendance: attendance
                        }
                    })
            })
        }catch(e){
            console.error(e)
            res.status(401).json({
                success: false,
                msg: "Permission denied"
            })
        }
    }
})

router.get('/semester-week', (req, res) => {
    // if(!('authorization' in req.headers)){
    //     res.json({
    //         success: false,
    //         msg: "Хандах эрхгүй байна"
    //     })
    // }else{
        try{
            // const token = req.headers.authorization.split(' ')[1]
            // jwt.verify(token, key)
            var semester_week = getWeeksDiff(new Date('2022-8-22'), new Date());
            res.json({
                success: true,
                data: semester_week
            })
        }catch(e){
            console.error(e)
            res.status(401).json({
                success: false,
                msg: "Permission denied"
            })
        }
    // }
})

function getWeeksDiff(startDate, endDate) {
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
  
    return Math.round(Math.abs(endDate - startDate) / msInWeek);
  }

module.exports = router