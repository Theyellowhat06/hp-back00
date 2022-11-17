// const express = require('express');
// const router = express.Router();
// const con = require('../db/index');
// const ss = require('sqlstring');
// const jwt = require('jsonwebtoken');
// const util = require('util');
// const { decode } = require('jsonwebtoken');
// const async = require('hbs/lib/async');
// const { resolve } = require('path');
// const { rejects } = require('assert');

// const key = 'MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2'

// const query = util.promisify(con.query).bind(con);

// router.get('/teacher', async (req, res) => {
//     try{
//         var sql = `select * from users_pt as up cross join part_time as pt cross join subjects as s where up.part_time_id = pt.id and pt.subject_code = s.code_ and up.user_code = '${req.}' and pt.part_time = 1;`
//         // if(!('authorization' in req.headers)){
//         //     res.status(401).json({
//         //         success: false,
//         //         msg: "Permission denied"
//         //     })
//         // }else{
//         //     const token = req.headers.authorization.split(' ')[1]
//         //     if(token != "null"){
//         //         const decoded = jwt.verify(token, key)
//         //         if(decoded.permission === 3){
//                     console.log(req.body)
//                     var sql = `select o.id as order_id, o.branch_id, o.user_id, o.status_id, o.is_rated, o.is_loan, CONVERT(o.created_at USING utf8) as created_at, s.*,
//                     (select (select name from deny_reason where o.status_id = 3 and id = deny_reason_id) from deny where ordr_id = o.id limit 1) as deny_reason, (select details from deny where o.status_id = 3 and deny_reason_id = 1 and ordr_id = o.id limit 1) as deny_reason_details
//                                 from ordr as o cross join sv_branch as s
//                                 where o.user_id = ${decoded.id} and o.branch_id = s.branch_id and MONTH(o.created_at) > MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
//                                 order by o.created_at desc`
//                     console.log("query: "+sql)
//                     con.query(sql, (err, rs, fields) => {
//                         if(err){
//                             res.status(400).json({
//                                 success: false,
//                                 msg: "parameter invalid"
//                             })
//                         }else{
//                             const o = []
//                             //console.log(rs)
//                             const rows = new Promise((resolve, rejects) => {
//                                 rs.forEach((element, ind, array) => {
                                    
//                                 //sql = `select o.id, o.qty, s.* from ordr_details as o cross join sv_product as s where o.stock_id = s.id and o.ordr_id = ${element.id}`
//                                 sql = `select * from sv_order_details where id = ${element.order_id}`
//                                 console.log(sql)
//                                 con.query(sql, (err, result, fields) => {
//                                     if(err){

//                                     }else{
//                                         //console.log(result)
//                                         let total_price = 0
                                        
//                                         result.forEach((e) => {
//                                             if(e.sale > 0){
//                                                 total_price += (e.price - ((e.price / 100) * e.sale)) * e.qty
//                                             }else{
//                                                 total_price += e.price * e.qty
//                                             }
//                                         })
//                                         let no_shipping_price = total_price
//                                         total_price += element.shipping
                                        
//                                         o.push({
//                                             id: element.order_id,
//                                             created_at: element.created_at,
//                                             branch_id: element.branch_id,
//                                             is_loan: element.is_loan,
//                                             is_rated: element.is_rated,
//                                             status_id: element.status_id,
//                                             total_price: total_price,
//                                             no_shipping_price: no_shipping_price,
//                                             shipping_price: element.shipping,
//                                             address: result[0].address,
//                                             payment_type: result[0].payment_type,
//                                             details: result,
//                                             deny_reason: element.deny_reason,
//                                             deny_reason_details: element.deny_reason_details,
//                                             store: {
//                                                 id: element.id,
//                                                 branch_id: element.branch_id,
//                                                 propic: element.propic,
//                                                 title: element.title,
//                                                 branch_title: element.branch_title,
//                                                 info: element.info,
//                                                 email: element.email,
//                                                 phone: element.phone,
//                                                 shipping: element.shipping,
//                                                 rate: element.rate,
//                                                 type: element.type_id,
//                                                 rate_count: element.rate_count,
//                                                 hot_aimag: element.hot_aimag,
//                                                 sum_duureg: element.sum_duureg,
//                                                 bag_horoo: element.bag_horoo,
//                                                 details: element.details,
//                                             }
//                                         })
//                                     }
//                                     if(ind === array.length - 1) resolve()
//                                 })
//                                 })
//                             })
//                             rows.then(() => {
//                                 //console.log(o)
//                                 res.status(200).json({
//                                     success: true,
//                                     orders: o
//                                 })
//                                 //console.log("this is o: ",o)
//                             })
//                         }
//                     })
//                 }else if(decoded.permission > 0 && decoded.permission < 3){
//                     console.log(req.body)
//                     var sql = `select o.id, o.branch_id, o.user_id, o.status_id, o.is_loan, CONVERT(o.created_at USING utf8) as created_at, 
//                                     u.id as uid, u.firstname, u.lastname, u.phone, u.email, u.rate, u.rate_count, CONVERT(u.propic USING utf8) as propic, CONVERT(u.created_at USING utf8) as ucreated_at ,
//                                     (select (select name from deny_reason where o.status_id = 3 and id = deny_reason_id) from deny where ordr_id = o.id limit 1) as deny_reason,
//                                     (select details from deny where o.status_id = 3 and deny_reason_id = 1 and ordr_id = o.id limit 1) as deny_reason_details,
//                                     (select shipping from store where (select store_id from branch where id = ${decoded.branch_id}) = id) as shipping
//                                 from ordr as o cross join users as u 
//                                 where o.branch_id = ${decoded.branch_id} and o.user_id = u.id and 
//                                     u.permission_id = 3 and MONTH(o.created_at) > MONTH(CURRENT_DATE - INTERVAL 1 MONTH) order by o.created_at desc`
//                     console.log("query: "+sql)
//                     con.query(sql, (err, result, fields) => {
//                         if(err){
//                             res.status(400).json({
//                                 success: false,
//                                 msg: "parameter invalid"
//                             })
//                         }else{
//                             const o = []
//                             //console.log(result)
//                             const rows = new Promise((resolve, rejects) => {
//                                 result.forEach((element, ind, array) => {
                                    
//                                     //sql = `select o.id, o.qty, s.* from ordr_details as o cross join sv_product as s where o.stock_id = s.id and o.ordr_id = ${element.id}`
//                                     sql = `select * from sv_order_details where id = ${element.id}`
//                                     con.query(sql, (err, result, fields) => {
//                                         if(err){

//                                         }else{
//                                             let total_price = 0
//                                             result.forEach((e) => {
//                                                 if(e.sale > 0){
//                                                     total_price += (e.price - ((e.price / 100) * e.sale)) * e.qty
//                                                 }else{
//                                                     total_price += e.price * e.qty
//                                                 }
//                                             })
//                                             let no_shipping_price = total_price
//                                             total_price += element.shipping
//                                             o.push({
//                                                 id: element.id,
//                                                 created_at: element.created_at,
//                                                 branch_id: element.branch_id,
//                                                 is_loan: element.is_loan,
//                                                 status_id: element.status_id,
//                                                 total_price: total_price,
//                                                 no_shipping_price: no_shipping_price,
//                                                 shipping_price: element.shipping,
//                                                 deny_reason: element.deny_reason,
//                                                 deny_reason_details: element.deny_reason_details,
//                                                 user: {
//                                                     id: element.uid,
//                                                     firstname: element.firstname,
//                                                     lastname: element.lastname,
//                                                     phone: element.phone,
//                                                     email: element.email,
//                                                     rate: element.rate,
//                                                     count: element.rate_count,
//                                                     propic: element.propic,
//                                                     created_at: element.ucreated_at
//                                                 },
//                                                 details: result
//                                             })
//                                         }
//                                         if(ind === array.length - 1) resolve()
//                                     })
//                                 })
//                             })
//                             rows.then(() => {
//                                 res.status(200).json({
//                                     success: true,
//                                     orders: o
//                                 })
//                                 //console.log("this is o: ",o)
//                             })
//                         }
//                     })
//                 }else{
//                     res.status(401).json({
//                         success: false,
//                         msg: "Permission denied"
//                     })
//                 }
//             }else{
//                 res.status(401).json({
//                     success: false,
//                     msg: "Permission denied"
//                 })
//             }
//         }
//     }catch(e){
//         console.error(e)
//         res.status(401).json({
//             success: false,
//             msg: "Permission denied"
//         })
//     }
// })

// module.exports = router