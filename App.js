import { useState, useEffect } from "react";
import io from "https://duffly.onrender.com";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [room, setRoom] = useState("");
  const [user, setUser] = useState("");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [joined, setJoined] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
      setTyping(false);
    });

    socket.on("chat_history", (messages) => {
      setChat(messages);
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    return () => {
      socket.off("receive_message");
      socket.off("chat_history");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, []);

  const joinRoom = () => {
    if (user && room) {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const send = () => {
    if (msg.trim()) {
      socket.emit("send_message", {
        room,
        user,
        content: msg,
      });
      socket.emit("stop_typing", room);
      setMsg("");
    }
  };

  const handleTyping = (e) => {
    setMsg(e.target.value);
    socket.emit("typing", room);
  };

  return (
    <>
      {/* BACKGROUND DUFFLY */}
      <div className="brand-bg one">Duffly</div>
      <div className="brand-bg two">Duffly</div>
      <div className="brand-bg three">Duffly</div>
      <div className="brand-bg four">Duffly</div>
      <div className="brand-bg five">Duffly</div>
      <div className="brand-bg six">Duffly</div>
      <div className="brand-bg seven">Duffly</div>

      <div className="app">
        {!joined ? (
          <div className="inputs">
            <div className="inner-title">Duffly</div>

            <input
              placeholder="Your name"
              onChange={(e) => setUser(e.target.value)}
            />

            <input
              placeholder="Room name"
              onChange={(e) => setRoom(e.target.value)}
            />

            <button onClick={joinRoom}>Join Chat</button>
          </div>
        ) : (
          <>
            <div className="chat-box">
              {chat.map((c, i) => (
                <div
                  key={i}
                  className={`message ${
                    c.user === user ? "sent" : "received"
                  }`}
                >
                  <b>{c.user}</b>
                  <br />
                  {c.content}
                </div>
              ))}
            </div>

            {typing && <small>Someone is typing...</small>}

            <div className="send-box">
              <input
                value={msg}
                onChange={handleTyping}
                placeholder="Type a message..."
              />
              <button onClick={send}>➤</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;



