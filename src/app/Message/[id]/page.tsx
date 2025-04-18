"use client";

import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import Navigation from "@/app/MemorialNavigation/page";
import { SendOutlined } from "@ant-design/icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface ReceiverEmail {
  params: Promise<{ id: string }>;
}

interface ChatHistory {
  id?: string;
  lastMessage?: string;
  participants?: string[];
  timestamp?: Dayjs | null;
}

interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
}

export default function MessageEmail({ params }: ReceiverEmail) {
  const { id } = React.use(params);
  const router = useRouter();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [myChatsUsers, setMyChatsUsers] = useState<ChatHistory[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const getUserData = async () => {
      const result = await fetchUserData();
      setUserEmail(result[0]?.User_Email);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getReceiverEmail = async () => {
      if (!id) return; // Prevent running if id is undefined

      try {
        const docRef = doc(db, "Users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const email = docSnap.data().User_Email;
          setReceiverEmail(email || "");
        } else {
          console.warn("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching receiver email:", error);
      }
    };
    getReceiverEmail();
  }, [id]);

  useEffect(() => {
    if (!userEmail) {
      console.log("There is not receiver Email");
      return;
    }
    try {
      const chatsHistory = collection(db, "chats");
      const q = query(
        chatsHistory,
        where("participants", "array-contains", userEmail)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const myChatsHistory = querySnapshot.docs.map(
          (doc) => doc.data() as ChatHistory
        );

        const uniqueChats = myChatsHistory.filter(
          (v, i, a) =>
            a.findIndex(
              (t) =>
                t.participants?.find((email: string) => email !== userEmail) ===
                v.participants?.find((email: string) => email !== userEmail)
            ) === i
        );

        setMyChatsUsers(
          uniqueChats.map((data) => ({
            ...data,
            timestamp: data.timestamp ? dayjs(data.timestamp.toDate()) : null,
          }))
        );
      });

      return () => unsubscribe();
    } catch (error) {
      console.error(error);
    }
  }, [userEmail]);

  console.log("Chats History: ", myChatsUsers);

  const latestChats = async (chatUserEmail: string) => {
    const userRef = collection(db, "Users");
    const userQ = query(userRef, where("User_Email", "==", chatUserEmail));
    const userSnap = await getDocs(userQ);

    let otherID: string = "";
    if (!userSnap.empty) {
      otherID = userSnap.docs[0].id;
    }
    router.push(`/Message/${otherID}`);
  };

  useEffect(() => {
    if (receiverEmail && userEmail) {
      console.log("Fetching messages for: ", userEmail, "and", receiverEmail);
    }

    const docRef = collection(db, "messages");
    const q = query(
      docRef,
      where("senderId", "==", userEmail),
      where("receiverId", "==", receiverEmail),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sentMessages = snapshot.docs.map((doc) => doc.data() as Message);

      const docRef = collection(db, "messages");
      const q2 = query(
        docRef,
        where("senderId", "==", receiverEmail),
        where("receiverId", "==", userEmail),
        orderBy("timestamp", "desc")
      );

      onSnapshot(q2, (snapshot2) => {
        const receivedMessages = snapshot2.docs.map(
          (doc) => doc.data() as Message
        );

        const combinedMessages = [...sentMessages, ...receivedMessages].sort(
          (a, b) => a.timestamp.toMillis() - b.timestamp?.toMillis()
        );

        setMessages(combinedMessages);
      });
    });

    return () => unsubscribe();
  }, [receiverEmail, userEmail]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewMessage("");

    if (newMessage.trim() === "" || !receiverEmail || !userEmail) {
      console.error("Invalid data: ", newMessage, userEmail, receiverEmail);
      return;
    }

    if (!userEmail || !receiverEmail) {
      console.error("User email or ReceiveUser email is missing:", {
        userEmail,
        receiverEmail,
      });
      return;
    }

    try {
      const messages = await addDoc(collection(db, "messages"), {
        senderId: userEmail,
        receiverId: receiverEmail,
        content: newMessage,
        timestamp: Timestamp.now(),
      });

      const chatId = [userEmail, receiverEmail].join("_");
      const chatRef = doc(db, "chats", chatId);
      await setDoc(chatRef, {
        participants: [userEmail, receiverEmail],
        lastMessage: newMessage,
        timestamp: Timestamp.now(),
      });

      console.log(messages);
    } catch (error) {
      console.error("Error sending message or updating chat: ", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <nav className="relative z-10">
        <Navigation />
      </nav>
      <div className="grid grid-cols-[35%_70%] px-32 py-5 gap-4 z-[1] h-full">
        <div className="pt-5 bg-white drop-shadow-xl rounded-xl px-5 flex flex-col gap-2 overflow-y-scroll relative">
          <div className="flex flex-row justify-between mb-6">
            <h1 className="text-3xl font-montserrat font-bold text-[#393939]">
              My Inbox
            </h1>
            <Image
              src="/Create Message.svg"
              width={36}
              height={36}
              alt="Create A Message Icon"
              className="object-contain cursor-pointer transform transition-all duration-50 ease-in-out active:scale-95"
            />
          </div>
          {myChatsUsers.map((data, index) => {
            return (
              <div
                key={index}
                onClick={() =>
                  latestChats(
                    data?.participants?.find(
                      (email: string) => email !== userEmail
                    ) || ""
                  )
                }
                className="h-fit py-2 bg-white rounded-md drop-shadow-md flex flex-row gap-5 items-center px-4"
              >
                <div>
                  <FontAwesomeIcon
                    icon={faCircleUser}
                    className="text-4xl text-blue-950"
                  />
                </div>
                <ul>
                  <li className="text-base font-semibold font-montserrat text-[#292828] text-wrap overflow-hidden text-ellipsis whitespace-nowrap">
                    {data?.participants?.find(
                      (email: string) => email !== userEmail
                    )}
                  </li>
                  <li className="flex flex-row gap-2 items-center text-gray-500 font-hind">
                    {data?.lastMessage}{" "}
                    <span className="text-gray-400 text-sm font-hind">
                      &#x2022; {data?.timestamp?.fromNow()}
                    </span>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
        <div className="pt-5 bg-white drop-shadow-xl rounded-xl overflow-y-scroll flex relative flex-col h-full justify-between">
          <div className="h-10 px-5 border-b-[1px] mb-4 border-slate-300 drop-shadow-md flex flex-row items-center pb-1 gap-4 ">
            <FontAwesomeIcon icon={faCircleUser} className="text-2xl" />
            <h1 className="font-montserrat font-medium text-[#565656] text-lg">
              {receiverEmail}
            </h1>{" "}
          </div>
          <div>
            <div className="px-4 mb-2">
              {messages.map((msg, index) => {
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg mb-2 w-fit max-w-[70%] ${
                      msg.senderId === userEmail
                        ? "bg-blue-500 text-white ml-auto text-right font-hind font-medium text-base"
                        : "bg-gray-300 text-black mr-auto text-left font-hind font-medium text-base"
                    }`}
                  >
                    {msg.content}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />{" "}
            </div>
            <div className="flex flex-row items-center">
              <form
                className="w-full pr-1 pl-2 py-2 flex flex-row"
                onSubmit={(e) => {
                  e.preventDefault(); // Prevent form submission
                  // handleSend(e); // Trigger the send action
                }}
              >
                <textarea
                  name="messages"
                  id="message"
                  className="resize-none bg-[#EAEBEC] outline-none w-full h-10 max-h-[8rem] px-4 py-2 rounded-2xl overflow-y-auto"
                  value={newMessage} // Bind value to newMessage state
                  onChange={(e) => setNewMessage(e.target.value)} // Update the state on input change
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevent adding a new line
                      handleSend(e); // Trigger the send action
                    }
                  }}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "2.25rem"; // Reset height
                    target.style.height = `${Math.min(
                      target.scrollHeight,
                      128
                    )}px`; // Dynamically adjust height
                  }}
                />
              </form>
              <button
                type="submit" // Change to 'submit' to trigger form submission
                className="flex items-center justify-center place-self-end bg-blue-500 text-white rounded-full h-10 w-10 hover:bg-blue-600 focus:outline-none"
                onClick={handleSend}
              >
                <SendOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
