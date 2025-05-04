import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
// import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
// [[{name: , inroom : }]]
let data = [[],[],[]]


export const serverAuth = async (id) => {
  try {

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    return { currentUser: user };
  } catch (error) {
    console.error("serverAuth error:", error);
    return 
  }
};



app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);


  io.on("connection", (socket) => {
    console.log("new Connection",socket.id);

    socket.on("addQueue", async({ id,index }) => {
      const { currentUser } = await serverAuth(id)
      const role = currentUser.username.split("-")[0]

      if (!data.some(arr => arr.some((user => user.name === currentUser.username))) && role !== "CONSULT") {
        // data[index].push(currentUser.username);
        data[index].push({name:currentUser.username,inroom:false});
      }else{
        socket.emit("error","คุณจองในคิวอื่นอยู่")
      }

      io.emit("dataResponse", data);
    });

    socket.on("clearQueue", async({ id }) => {
      const { currentUser } = await  serverAuth(id)
      const role = currentUser.username.split("-")[0]
      // console.log("", index, role)
      
      if (role == "CONSULT") {
        const index = currentUser.username.split("-")[1][1]-1
        if (data[index].length > 0) {
          data[index].shift()
        }else{
          socket.emit("error","ยังไม่มีคิว")
        }
      }else{
        socket.emit("error","คุณไม่ใช่ CONSULT")
      }
      io.emit("dataResponse", data);
    })

    socket.on("InRoomQueue", async({ id }) => {
      const { currentUser } = await  serverAuth(id)
      const role = currentUser.username.split("-")[0]
      
      if (role == "CONSULT") {
        const index = currentUser.username.split("-")[1][1]-1
        if (data[index].length > 0) {
          data[index][0].inroom = !data[index][0].inroom
        }else{
          socket.emit("error","ยังไม่มีคิว")
        }
      }else{
        socket.emit("error","คุณไม่ใช่ CONSULT")
      }
      io.emit("dataResponse", data);
    })
  
    socket.on("getData", async({ id }) => {

      const { currentUser } = await serverAuth(id);
      // console.log(currentUser,id)

      if (!currentUser) {
        socket.emit("error","unauthorized");
      }else{
        socket.emit("dataResponse", data);
      }

    });
    // socket.on("admin", async({ id,newData,password }) => {

    //   const { currentUser } = await serverAuth(id);
    //   if( password == 12345){
    //     data = newData
    //     io.emit("dataResponse", data);
    //   }else{
    //     socket.emit("error","คุณไม่ใช่ admin")
    //   }

    // });
    socket.on("admin", async ({ id, text, password }) => {
      try {
        const { currentUser } = await serverAuth(id);
        const role = currentUser.username.split("-")[0]

        if (role == "Admin") {
          return socket.emit("error", "คุณไม่ใช่ admin");
        }
    
        if (password !== "12345") {
          return socket.emit("error", "รหัสผ่านไม่ถูกต้อง");
        }
    
        let newData;
        try {
          newData = JSON.parse(text);
        } catch (e) {
          return socket.emit("error", "JSON ไม่ถูกต้อง");
        }
    
        const isValidStructure = (data) => {
          if (!Array.isArray(data)) return false;
        
          return data.every(inner =>
            Array.isArray(inner) &&
            inner.every(obj =>
              typeof obj === "object" &&
              obj !== null &&
              !Array.isArray(obj) &&
              Object.keys(obj).length === 2 &&
              typeof obj.name === "string" &&
              typeof obj.inroom === "boolean"
            )
          );
        };
    
        if (!isValidStructure(newData)) {
          return socket.emit("error", "โครงสร้างข้อมูลไม่ถูกต้อง");
        }
    
        data = newData;
        io.emit("dataResponse", data);
        
      } catch (err) {
        socket.emit("error", "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์");
      }
    });
  });
  io.on("disconnect", (socket) => {
    console.log(socket.id); 
  });
  

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});