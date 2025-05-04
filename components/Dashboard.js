import React from "react";
import { useEffect, useState } from "react";
import { socket } from "./socket";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import Login from "./Login";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [data, setData] = useState([], [], []);
  const [isConsult, setIsConsult] = useState(false);
  const [consultIndex, setConsultIndex] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [text, setText] = useState(""); // แสดงข้อมูลในรูปแบบ JSON
  const [password, setPassword] = useState("");


  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (status != "authenticated") return;
    if (!isConnected) return;
    const id = session.user.id;
    const role = session.user.username.split("-")[0];

    if (role == "CONSULT") {
      setIsConsult(true);
      const index = session.user.username.split("-")[1][1] - 1;
      setConsultIndex(index);
    }

    socket.emit("getData", { id });

    const handleData = (d) => {
      setData(d);
      setText(JSON.stringify(d, null, 2))
    };

    const handleError = (text) => {
      const id = toast.error(text);
    };

    socket.on("dataResponse", handleData);
    socket.on("error", handleError);

    return () => {
      socket.off("dataResponse", handleData);
      socket.off("error", handleError);
    };
  }, [isConnected, session, status]);

  const addQueue = (index) => {
    if (status != "authenticated") return;
    const id = session.user.id;
    if (id) {
      socket.emit("addQueue", { id, index });
    }
  };

  const clearQueue = () => {
    if (status != "authenticated") return;
    const id = session.user.id;
    if (id) {
      socket.emit("clearQueue", { id });
    }
  };
  const ToggleInRoom = () => {
    if (status != "authenticated") return;
    const id = session.user.id;
    if (id) {
      socket.emit("InRoomQueue", { id });
    }
  };
  const handleChange = () => {
    let newData;
    try {
      newData = JSON.parse(text);
      AdminControl(newData, password);
    } catch (e) {
      const id = toast.error("Invalid JSON format");
    }
  };

const isValidStructure = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(inner =>
    Array.isArray(inner) &&
    inner.every(obj =>
      typeof obj === "object" &&
      typeof obj.name === "string" &&
      typeof obj.inroom === "boolean"
    )
  );
};


const AdminControl = (newData, password) => {
  if (status !== "authenticated") return;
  if (!isAdmin) return;

  if (!isValidStructure(newData)) {
    const id = toast.error("Invalid data structure. It must be [[{ name: string, inroom: boolean }]].");
    return;
  }

  const id = session?.user?.id;
  if (id) {
    socket.emit("admin", { id, newData, password });
  }
};


  return (
    <>
      <div
        id="main"
        className={`${
          status == "authenticated"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } duration-500  min-h-screen bg-neutral-50 flex flex-col items-center font-IBM-Plex text-gray-500`}
      >
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Slide}
        />
        <header id="header" className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto flex justify-between items-center">
            {/* <h1 className="text-xl">Queue Management</h1>
          <div className="flex items-center gap-4"></div> */}
          </div>
        </header>

        <main id="queue-content" className="container mx-auto p-6">
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 justify-between">
              <p className="text-neutral-700 font-medium underline">
                {session?.user.username
                  ? session.user.username
                  : "disconnected"}
              </p>
              <div className="flex items-centergap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 duration-500 hover:text-gray-700">
                <button className="cursor-pointer" onClick={() => signOut()}>
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        </main>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container p-6">
          {data.map((item, index) => {
            return (
              <div
                className="bg-white rounded-lg shadow-sm  duration-200"
                key={index}
              >
                <div className="p-4 border-b-[1px] border-gray-200">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-medium">
                      CONSULT - 0{index + 1}
                    </h2>
                  </div>
                </div>
                <div className="divide-y divide-neutral-200">
                  <div className="p-4">
                    {item.map((tag, j) => (
                      <div
                        className={`flex items-center gap-2 mb-4 ${
                          j != 0 ? "opacity-20" : ""
                        } duration-200`}
                        key={j}
                      >
                        <span className="text-neutral-700">
                          {j + 1}
                          {")"}
                        </span>
                        <div className="flex items-center gap-2">
                          <p>{tag.name}</p>
                        </div>
                      </div>
                    ))}
                    {item.length == 0 && <p className="text-ce">ยังไม่มีคิว</p>}
                  </div>
                </div>

                {/* <!-- Room Status --> */}
                <div className="p-4 border-t-[1px] border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-door-open text-2xl text-neutral-700"></i>
                      <div>
                        <h3>Room {["S7", "S8", "S9"][index]}</h3>
                        <p className="text-sm text-neutral-500">
                          {item[0]?.inroom ? "มีคนกำลังปรึกษา" : "ว่างเเล้ว"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer bg-gray-100">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item[0]?.inroom ? "bg-red-300" : " bg-green-300"
                        }`}
                      ></div>
                      <span className="text-sm">
                        {item[0]?.inroom ? "ห้องไม่ว่าง" : "ห้องว่าง"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* <!-- Action Buttons --> */}
                {!isAdmin && (
                  <div className="px-8 p-6 border-t border-gray-200 text-sm text-gray-300">
                    {!isConsult ? (
                      <AlertDialog className="font-IBM-Plex">
                        <AlertDialogTrigger className="w-full py-2 border-[0.5px] hover:bg-gray-100 border-gray-300 text-gray-500  rounded-lg cursor-pointer ">
                          จองคิว
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-IBM-Plex">
                              คุณเเน่ใจที่จองคิวหรือไม่
                            </AlertDialogTitle>
                            <AlertDialogDescription></AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-IBM-Plex">
                              ยกเลิก
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                addQueue(index);
                              }}
                              className="font-IBM-Plex"
                            >
                              เเน่ใจ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <div
                        className={`flex gap-2  ${
                          index == consultIndex
                            ? "pointer-events-auto"
                            : "pointer-events-none opacity-50"
                        }`}
                      >
                        <AlertDialog>
                          <AlertDialogTrigger className="w-full py-2 border-[0.5px] hover:bg-gray-100 border-gray-300 text-gray-500  rounded-lg cursor-pointer hover:w-[125%] duration-200">
                            ลบคิวบนสุด
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                น้องได้รับการ Consult เเล้ว
                              </AlertDialogTitle>
                              <AlertDialogDescription></AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-IBM-Plex">
                                ไม่
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  clearQueue();
                                }}
                                className="font-IBM-Plex"
                              >
                                ใช่
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger className="w-full  py-2 border-[0.5px] hover:bg-gray-100 border-gray-300 text-gray-500  rounded-lg cursor-pointer hover:w-[125%] duration-200">
                            อยู่ในห้องเเล้ว
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                น้องได้เข้าห้อง Consult เเล้ว
                              </AlertDialogTitle>
                              <AlertDialogDescription></AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-IBM-Plex">
                                ไม่
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  ToggleInRoom();
                                }}
                                className="font-IBM-Plex"
                              >
                                ใช่
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {isAdmin && (
        <div>
        <textarea
          rows={10}
          cols={50}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleChange}>Change</button>
      </div>
      )}
      <div
        className={`${
          status == "unauthenticated"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } duration-500 absolute top-0 left-0 w-screen h-screen`}
      >
        <Login />
      </div>
    </>
  );
}
