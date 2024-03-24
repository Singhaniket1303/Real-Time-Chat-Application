//Client-side
"use client";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const Chat = () => {
  const [socketClient, setSocketClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showPrompt, setShowPrompt] = useState(true);
  const messageContainerRef = useRef(null);
  const [userNames, setUserNames] = useState([]);

  useEffect(() => {
    const newSocketClient = io("http://localhost:3001");
    setSocketClient(newSocketClient);

    return () => newSocketClient.disconnect();
  }, []);

  useEffect(() => {
    if (socketClient) {
      socketClient.on("User-joined", (name) => {
        if (!userNames.includes(name)) {
          setUserNames((prevUserNames) => [...prevUserNames, name]);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: `${name} is joined chat`,
              position: "right",
              isUserName: true,
            },
          ]);
        }
      });

      socketClient.on("receive-message", (data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { message: `${data.name}: ${data.message}`, position: "left" },
        ]);
      });

      return () => {
        socketClient.off("User-joined");
        socketClient.off("receive-message");
      };
    }
  }, [socketClient]);

  const append = (message, position, isUserName) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message,
        position,
        isUserName,
        className: position === "left" ? "float-left" : "float-right",
      },
    ]);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    if (name) {
      socketClient.emit("new-user-joined", name);
      append(`${name} is joined chat`, "right", true);
      setUserNames((prevUserNames) => [...prevUserNames, name]);
      setShowPrompt(false);
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    if (message && socketClient && userNames[0]) {
      socketClient.emit("send-message", { name: userNames[0], message });
      append(`${userNames[0]}: ${message}`, "left", false);
      e.target.message.value = "";
    }
  };

  return (
    <>
      <div className="h-screen bg-gradient-to-r from-[#EFD0CA] to-blue-500">
        <div className="inline  ">
          <img
            className="ml-4 max-h auto max-h-[10rem] rounded-3xl  "
            src="/msgicon.png"
          />
          <p className="text-[3rem] text-center text-[30px] ">
            CONNECT THE WORLD WITH ONE CLICK
          </p>
        </div>
        <div className=" h-[5rem] bg-[#5F708D] text-center">
          {showPrompt && (
            <form onSubmit={handleNameSubmit}>
              <label
                className=" text-[25px] mr-[1rem] text-slate-100"
                htmlFor="name"
              >
                Enter Your Name To Join:
              </label>
              <input
                className="mt-[1rem] text-[25px] rounded-xl"
                type="text"
                name="name"
                id="name"
                placeholder="Name Please......."
              />
              <button
                type="submit"
                className="border-2 text-slate-100 border-black rounded-2xl cursor-pointer btn ml-6  text-[22px]  border-[#ffffff] p-1  "
              >
                Join
              </button>
            </form>
          )}
        </div>
        <div
          className="container  overflow-y-scroll max-w-[70rem] h-[60vh] mb-[1rem] bg-[#979B8D] m-auto mt-[2rem] overflow-y "
          ref={messageContainerRef}
        >
          {messages.map(({ message, position, isUserName }, index) => (
            <div
              key={index}
              className={`message ${message} ${position} bg-gray-400 w-[28rem] mb-4 m-4 text-white text-xl p-2  border-2 border-black rounded-lg `}
            >
              {message}
            </div>
          ))}
        </div>
        <div className="text-center">
          <form onSubmit={handleMessageSubmit}>
            <input
              type="text"
              name="message"
              placeholder="Type a message"
              id="message"
              className="w-[50rem] p-4 border-2 border-black rounded-2xl text-lg"
            />
            <button
              className="btn ml-2 cursor-pointer border-2 border-black rounded-3xl  p-4 text-lg "
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chat;
