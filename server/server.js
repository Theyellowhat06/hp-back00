const express = require('express');
//const { Server } = require("socket.io");
const teacher = require('./routes/teacher');
const user = require('./routes/user')
const affairs = require('./routes/student-affairs')
// const productRouter = require('./routes/product');
// const catRouter = require('./routes/cat');
// const imageRouter = require('./routes/image');
// const userRouter = require('./routes/user');
// const storeRouter = require('./routes/store');
// const orderRouter = require('./routes/order')
// const paytypeRouter = require('./routes/paytype')

const bodyParser = require('body-parser');


const cors = require('cors');
const http = require("http");
const app = express();

const hostname = '127.0.0.1';
const port = 3080;

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(cors());
const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3001",
//     methods: ["GET", "POST"],
//   },
// });
// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on("join_room", (data) => {
//     socket.join(data);
//   });

//   socket.on("send_message", (data) => {
//     socket.to(data.room).emit("receive_message", data);
//   });
// });
app.use(express.json());
app.post('/', (req, res) =>{
    console.log("working");
    console.log(` ${req.query.test ? `hast test`: `no test`} hoho`)
    res.json(
        {
        data:[
            {
              phone: "88793644",
              text: "$HX,RESET,317702"
            },
            {
              phone: "88793822",
              text: "$HX,RESET,343120"
            },
            {
                phone: "89724381",
                text: "$HX,RESET,313149"
            }
          ]
        }
)
})
app.use("/teacher", teacher);
app.use("/user", user);
app.use('/student-affairs',affairs)
// app.use("/product", productRouter);
// app.use("/cat", catRouter);
// app.use("/image", imageRouter)
// app.use('/user', userRouter)
// app.use('/store', storeRouter)
// app.use('/order', orderRouter)
// app.use('/paytype', paytypeRouter)
app.listen(port);