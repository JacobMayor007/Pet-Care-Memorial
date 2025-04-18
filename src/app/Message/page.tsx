"use client";
// import { getAuth, onAuthStateChanged, User } from "firebase/auth";
// import { app } from "../firebase/config";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useRouter } from "next/navigation";
// import { faCircleUser, faXmark } from "@fortawesome/free-solid-svg-icons";
// import { db } from "../firebase/config";
// import Image from "next/image";
// import { SendOutlined } from "@ant-design/icons";
// import {
//   setDoc,
//   orderBy,
//   onSnapshot,
//   collection,
//   query,
//   where,
//   getDocs,
//   DocumentData,
//   Timestamp,
//   addDoc,
//   doc,
//   limit,
// } from "firebase/firestore";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";
// import { useState, useEffect, useRef } from "react";
// import ClientNavbar from "../ClientNavbar/page";

import { Modal } from "antd";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import Link from "next/link";

// interface Message {
//   senderId: string;
//   receiverId: string;
//   content: string;
//   timestamp: Timestamp;
// }

// interface Users {
//   User_UID: string;
//   User_Name: string;
//   CreatedAt: {
//     seconds: number;
//     nanoseconds: number;
//   };
//   User_Email: string;
// }

// export default function Messages() {
//   const router = useRouter();
//   const auth = getAuth(app);
//   const [user] = useAuthState(auth);
//   const [searchUser, setSearchUser] = useState(false);
//   const [userList, setUserList] = useState<DocumentData[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([]);
//   const [filteredChattedUsers, setFilteredChattedUsers] = useState<
//     DocumentData[]
//   >([]);

//   const [lsData, setLsData] = useState<DocumentData[]>([]);
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [receiveUser, setReceiveUser] = useState<User | null>(null);
//   const [receiverLS, setReceiverLS] = useState("");
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const dummy = useRef<HTMLDivElement | null>(null); // Ref for the scroll position

//   useEffect(() => {
//     // Only scroll if dummy.current is defined
//     if (dummy.current) {
//       dummy.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]); // This will run whenever messages array changes

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     const fetchMyChats = async () => {
//       if (!user?.email) return;

//       try {
//         const chatsCollection = collection(db, "chats");
//         const q = query(
//           chatsCollection,
//           where("participants", "array-contains", user.email)
//         );

//         const snapshot = await getDocs(q);
//         const chatsUsers = await Promise.all(
//           snapshot.docs.map(async (doc) => {
//             const data = doc.data();
//             const receiverEmail = data.participants.find(
//               (email: string) => email !== user.email
//             );

//             // Fetch the last message for the chat
//             const messagesCollection = collection(db, "messages");
//             const messagesQuery = query(
//               messagesCollection,
//               where("senderId", "in", [user.email, receiverEmail]),
//               where("receiverId", "in", [user.email, receiverEmail]),
//               orderBy("timestamp", "desc"),
//               limit(1)
//             );
//             const messagesSnapshot = await getDocs(messagesQuery);
//             const lastMessage = messagesSnapshot.empty
//               ? null
//               : messagesSnapshot.docs[0].data().content;

//             return {
//               id: doc.id,
//               email: receiverEmail,
//               lastMessage: lastMessage,
//             };
//           })
//         );

//         const uniqueChats = chatsUsers.filter(
//           (v, i, a) => a.findIndex((t) => t.email === v.email) === i
//         );

//         setFilteredChattedUsers(uniqueChats);
//       } catch (error) {
//         console.error("Error on fetching user chats", error);
//       }
//     };

//     fetchMyChats();
//   }, [user]); // Ensure this dependencies array is consistently present

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         // Fetch data from the Firestore "Users" collection
//         const userCollection = collection(db, "Users");

//         const userSnapshot = await getDocs(userCollection);

//         // Map over the snapshot to extract user data, including document ID
//         const userList = userSnapshot.docs.map((doc) => {
//           const data = doc.data();
//           console.log("Document Data:", data); // Debugging line
//           return {
//             id: doc.id, // Add the document ID here
//             fullName: `${data.User_FName || ""} ${
//               data.User_LName || ""
//             }`.trim(),
//             email: data.User_Email || "No Email",
//           };
//         });

//         console.log("Fetched Users:", userList); // Debugging line
//         setUserList(userList); // Update the state with all users
//         setFilteredUsers(userList); // Initially set filteredUsers to all users
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const receiver = userList.find(
//     (user) => user.email === "receiver@example.com"
//   );
//   if (receiver) {
//     console.log("Receiver ID:", receiver.id); // Use this ID as receiverId
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.toLowerCase();
//     setSearchValue(value); // Update search value in state

//     // Filter users based on full name or email
//     const filtered = userList.filter(
//       (user) =>
//         user.fullName.toLowerCase().includes(searchValue) ||
//         user.email.toLowerCase().includes(searchValue)
//     );

//     setFilteredUsers(filtered); // Update filtered users with the search results
//   };

//   useEffect(() => {
//     console.log("Current user email:", user?.email);
//     console.log("Selected receiver email:", receiveUser?.email);
//     console.log("Fetched messages:", messages);
//   }, [messages, user, receiveUser]);

//   useEffect(() => {
//     if (user?.email && receiveUser?.email) {
//       console.log(
//         "Fetching messages for:",
//         user.email,
//         "and",
//         receiveUser.email
//       );

//       const q = query(
//         collection(db, "messages"),
//         where("senderId", "==", user.email),
//         where("receiverId", "==", receiveUser.email),
//         orderBy("timestamp", "asc")
//       );

//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         const sentMessages = snapshot.docs.map((doc) => doc.data() as Message);

//         const q2 = query(
//           collection(db, "messages"),
//           where("senderId", "==", receiveUser.email),
//           where("receiverId", "==", user.email),
//           orderBy("timestamp", "asc")
//         );

//         onSnapshot(q2, (snapshot2) => {
//           const receivedMessages = snapshot2.docs.map(
//             (doc) => doc.data() as Message
//           );

//           const combinedMessages = [...sentMessages, ...receivedMessages].sort(
//             (a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()
//           );

//           setMessages(combinedMessages);
//           console.log("Fetched messages:", combinedMessages);
//         });
//       });

//       return () => unsubscribe();
//     }
//   }, [user, receiveUser]);

//   const handleSend = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setNewMessage("");

//     // Check if newMessage, user, and receiveUser are valid
//     if (newMessage.trim() === "" || !receiveUser || !user) {
//       console.error("Invalid data: ", { newMessage, user, receiveUser });
//       return;
//     }

//     // Check if the user and receiveUser have valid UID (email in this case)
//     if (!user.email || !receiveUser.email) {
//       console.error("User email or ReceiveUser email is missing:", {
//         user,
//         receiveUser,
//       });
//       return;
//     }

//     const message: Message = {
//       senderId: user.email, // Use email as sender ID
//       receiverId: receiveUser.email, // Use email as receiver ID
//       content: newMessage,
//       timestamp: Timestamp.now(),
//     };

//     console.log("Sending message: ", message); // Log the message to check values

//     try {
//       // Add the message to the 'messages' collection
//       const messages = await addDoc(collection(db, "messages"), message);

//       // Add/update the 'chats' collection
//       const chatId = [user.email, receiveUser.email].join("_"); // Consistent chatId using email
//       const chatRef = doc(db, "chats", chatId);
//       await setDoc(chatRef, {
//         participants: [user.email, receiveUser.email],
//         lastMessage: newMessage,
//         timestamp: Timestamp.now(),
//       });
//       console.log(messages);

//       localStorage.clear();
//     } catch (error) {
//       console.error("Error sending message or updating chat: ", error);
//     }
//   };

//   const handleReceivedUser = (selectedUser: DocumentData) => {
//     console.log("Selected user:", selectedUser);
//     const userObj = { email: selectedUser.email } as User;
//     localStorage.clear();
//     setReceiveUser(userObj);
//   };

//   useEffect(() => {
//     const storedReceiveUser = localStorage.getItem("receiveUser");
//     if (storedReceiveUser) {
//       setReceiveUser(JSON.parse(storedReceiveUser));
//     }
//   }, []);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         router.push("/Login");
//       }
//     });
//     return () => unsubscribe();
//   });

//   return (
//     <div>
//       {user ? (
//         <section className="relative">
//           <div className="relative z-10">
//             <ClientNavbar />
//           </div>
//           <div className="grid grid-cols-[35%_70%] h-screen px-32 py-5 gap-4 z-[1]">
//             <div className="pt-5 bg-white drop-shadow-xl rounded-xl px-5 flex flex-col gap-4 overflow-y-scroll relative">
//               <div className="flex flex-row justify-between ">
//                 <h1 className="text-3xl font-montserrat font-bold text-[#393939]">
//                   My Inbox
//                 </h1>
//                 <Image
//                   src="/Create Message.svg"
//                   width={36}
//                   height={36}
//                   alt="Create A Message Icon"
//                   className="object-contain cursor-pointer transform transition-all duration-50 ease-in-out active:scale-95"
//                   onClick={() => setSearchUser((prev) => !prev)}
//                 />
//               </div>
//               <div className="h-12 bg-[#EAEBEC] rounded-xl flex flex-row items-center gap-5 px-4">
//                 <FontAwesomeIcon icon={faSearch} className="text-[#b6bbc0]" />
//                 <input
//                   type="text"
//                   className="w-full h-full outline-none bg-[#EAEBEC] rounded-xl font-hind tracking-wide text-base text-slate-900"
//                   placeholder="Search for keywords here"
//                 />
//               </div>
//               <div>
//                 {filteredChattedUsers.length > 0 ? (
//                   filteredChattedUsers.map((chatted, index) => {
//                     return (
//                       <ul
//                         key={index}
//                         className="cursor-pointer grid grid-cols-[50px_80%] items-center gap-1 grid-rows-[70px] border-[1px] bg-white drop-shadow-lg pl-4 rounded-2xl text-wrap"
//                         onClick={() => handleReceivedUser(chatted)}
//                       >
//                         <li className="">
//                           <FontAwesomeIcon
//                             icon={faCircleUser}
//                             className="text-4xl text-blue-950"
//                           />{" "}
//                         </li>
//                         <div className="w-full">
//                           <li className="text-lg font-hind font-medium text-[#292828] text-wrap overflow-hidden text-ellipsis whitespace-nowrap">
//                             {chatted.email}
//                           </li>
//                           <li className="text-sm font-hind font-semibold text-[#9b9b9b]">
//                             {chatted.lastMessage}
//                           </li>
//                         </div>
//                       </ul>
//                     );
//                   })
//                 ) : (
//                   <p className="text-gray-500">No users to display</p>
//                 )}
//               </div>
//             </div>
//             <div className="pt-5 bg-white drop-shadow-xl rounded-xl overflow-y-scroll  relative flex-col h-full">
//               {receiveUser ? (
//                 <div className="flex flex-col justify-between h-full gap-2">
//                   <div className="h-10 px-5 border-b-[1px] border-slate-300 drop-shadow-md flex flex-row items-center pb-1 gap-4 ">
//                     <FontAwesomeIcon icon={faCircleUser} className="text-2xl" />
//                     <h1 className="font-montserrat font-medium text-[#565656] text-lg">
//                       {receiveUser.email}
//                     </h1>{" "}
//                   </div>
//                   <div className="w-full h-full overflow-y-auto p-4 flex flex-col">
//                     {messages.length > 0 ? (
//                       messages.map((msg, index) => (
//                         <div
//                           key={index}
//                           className={`p-3 rounded-lg mb-2 max-w-[70%] ${
//                             msg.senderId === user?.email
//                               ? "bg-blue-500 text-white ml-auto text-right font-hind font-medium text-base"
//                               : "bg-gray-300 text-black mr-auto text-left font-hind font-medium text-base"
//                           }`}
//                         >
//                           {msg.content}
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-center">
//                         No messages to display
//                       </p>
//                     )}
//                     <div ref={messagesEndRef} />{" "}
//                   </div>

//                   {/*Submit Messages*/}
//                   <form
//                     className="w-full bg-[#f5f9d7] pr-1 pl-2 py-2 flex flex-row"
//                     onSubmit={(e) => {
//                       e.preventDefault(); // Prevent form submission
//                       handleSend(e); // Trigger the send action
//                     }}
//                   >
//                     <textarea
//                       name="messages"
//                       id="message"
//                       className="resize-none bg-orange-400 outline-none w-full h-10 max-h-[8rem] px-4 py-2 rounded-2xl overflow-y-auto"
//                       value={newMessage} // Bind value to newMessage state
//                       onChange={(e) => setNewMessage(e.target.value)} // Update the state on input change
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter" && !e.shiftKey) {
//                           e.preventDefault(); // Prevent adding a new line
//                           handleSend(e); // Trigger the send action
//                         }
//                       }}
//                       rows={1}
//                       onInput={(e) => {
//                         const target = e.target as HTMLTextAreaElement;
//                         target.style.height = "2.25rem"; // Reset height
//                         target.style.height = `${Math.min(
//                           target.scrollHeight,
//                           128
//                         )}px`; // Dynamically adjust height
//                       }}
//                     />
//                     <button
//                       type="submit" // Change to 'submit' to trigger form submission
//                       className="ml-2 flex items-center justify-center bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none"
//                     >
//                       <SendOutlined tabIndex={0} />
//                     </button>
//                   </form>
//                 </div>
//               ) : receiverLS ? (
//                 <div className="flex flex-col justify-between h-full gap-2">
//                   <div className="h-10 px-5 border-b-[1px] border-slate-300 drop-shadow-md flex flex-row items-center pb-1 gap-4 ">
//                     <FontAwesomeIcon icon={faCircleUser} className="text-2xl" />
//                     <h1 className="font-montserrat font-medium text-[#565656] text-lg">
//                       {receiverLS}
//                     </h1>{" "}
//                   </div>
//                   <div className="w-full h-full overflow-y-auto p-4 flex flex-col">
//                     {messages.length > 0 ? (
//                       messages.map((msg, index) => (
//                         <div
//                           key={index}
//                           className={`p-3 rounded-lg mb-2 max-w-[70%] ${
//                             msg.senderId === user?.email
//                               ? "bg-blue-500 text-white ml-auto text-right font-hind font-medium text-base"
//                               : "bg-gray-300 text-black mr-auto text-left font-hind font-medium text-base"
//                           }`}
//                         >
//                           {msg.content}
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-center">
//                         No messages to display
//                       </p>
//                     )}
//                     <div ref={messagesEndRef} />{" "}
//                   </div>

//                   {/*Submit Messages*/}
//                   <div className="flex flex-row items-center">
//                     <form
//                       className="w-full pr-1 pl-2 py-2 flex flex-row"
//                       onSubmit={(e) => {
//                         e.preventDefault(); // Prevent form submission
//                         // handleSend(e); // Trigger the send action
//                       }}
//                     >
//                       <textarea
//                         name="messages"
//                         id="message"
//                         className="resize-none bg-[#EAEBEC] outline-none w-full h-10 max-h-[8rem] px-4 py-2 rounded-2xl overflow-y-auto"
//                         value={newMessage} // Bind value to newMessage state
//                         onChange={(e) => setNewMessage(e.target.value)} // Update the state on input change
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" && !e.shiftKey) {
//                             e.preventDefault(); // Prevent adding a new line
//                             handleSend(e); // Trigger the send action
//                           }
//                         }}
//                         rows={1}
//                         onInput={(e) => {
//                           const target = e.target as HTMLTextAreaElement;
//                           target.style.height = "2.25rem"; // Reset height
//                           target.style.height = `${Math.min(
//                             target.scrollHeight,
//                             128
//                           )}px`; // Dynamically adjust height
//                         }}
//                       />
//                     </form>
//                     <button
//                       type="submit" // Change to 'submit' to trigger form submission
//                       className="flex items-center justify-center place-self-end bg-blue-500 text-white rounded-full h-10 w-10 hover:bg-blue-600 focus:outline-none"
//                       onClick={handleSend}
//                     >
//                       <SendOutlined />
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="h-full w-full flex items-center justify-center">
//                   <div className="flex flex-col items-center gap-5">
//                     <h1 className="font-sigmar font-extrabold text-5xl text-[#393939] ">
//                       Select a message <br /> to display
//                     </h1>
//                     <button
//                       className="bg-[#006B95] rounded-xl h-12 w-80 text-xl text-[#FEFEFE] transform transition-all duration-50 ease-in-out active:scale-95"
//                       onClick={() => setSearchUser(true)}
//                     >
//                       New Message
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>{" "}
//           </div>
//           {searchUser ? (
//             <div className="absolute top-32 bg-white left-[480px] h-2/3 w-96 border-[1px] border-[#c9c8c8] drop-shadow-lg rounded-xl py-2 px-1">
//               <div className="flex justify-end pr-1 mb-2">
//                 <FontAwesomeIcon
//                   icon={faXmark}
//                   className="cursor-pointer text-xl text-[#565656]"
//                   onClick={() => setSearchUser(false)}
//                 />
//               </div>

//               <div className="h-10 bg-[#EAEBEC] rounded-xl flex flex-row items-center gap-5 px-4">
//                 <FontAwesomeIcon icon={faSearch} className="text-[#b6bbc0]" />
//                 <input
//                   type="text"
//                   className="w-full h-full outline-none bg-[#EAEBEC] rounded-xl font-hind tracking-wide text-base text-slate-900"
//                   placeholder="To"
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 {filteredUsers.length > 0 && searchValue ? (
//                   <ul>
//                     {filteredUsers.map((user, index) => (
//                       <li
//                         key={index}
//                         className="p-2 border-b border-gray-200 grid grid-cols-[50px_auto] w-full items-center gap-4"
//                         onClick={() => {
//                           handleReceivedUser(user);
//                           localStorage.clear();
//                           setSearchUser(false);
//                         }}
//                       >
//                         <FontAwesomeIcon
//                           icon={faCircleUser}
//                           className="text-5xl text-gray-500"
//                         />
//                         <div className="font-bold flex flex-col">
//                           <h1 className="font-montserrat text-lg font-extrabold text-[#393939]">
//                             {user.fullName}
//                           </h1>
//                           <p className="text-sm font-montserrat font-light text-[#393939]">
//                             {user.email}
//                           </p>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p></p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div></div>
//           )}
//         </section>
//       ) : (
//         <div className={user ? `block` : `hidden`}></div>
//       )}
//     </div>
//   );
// }

export default function Message() {
  const [searchValue, setSearchValue] = useState("");
  const [userList, setUserList] = useState<DocumentData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([]);

  useEffect(() => {
    const getUsersList = async () => {
      const docRef = collection(db, "Users");
      const userSnapshot = await getDocs(docRef);

      const userList = userSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: `${data?.User_Name}`,
          email: `${data?.User_Email}`,
        };
      });

      console.log("Fetch Users: ", userList);
      setUserList(userList);
    };
    getUsersList();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    const filtered = userList.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );

    setFilteredUsers(filtered); // Update filtered users with the search results
  };
  return (
    <div>
      <Modal
        open
        className="relative"
        onClose={() => history.back()}
        onCancel={() => history.back()}
      >
        <h1>
          Please search the user email who you want to have a conversation with.
        </h1>

        <input
          type="text"
          name="search"
          id="search-user-id"
          placeholder="Search user email"
          onChange={handleInputChange}
          className="h-8 border-2 border-[#797979] rounded-lg drop-shadow-md font-hind px-2 my-10 w-96 mx-auto outline-none"
        />
        {filteredUsers.length > 0 && searchValue ? (
          <div className="absolute  bg-white w-fit  flex flex-col gap-2 rounded-md">
            {filteredUsers?.slice(0, 7).map((user, index) => {
              return (
                <Link
                  href={`/Message/${user?.id}`}
                  key={index}
                  className="border-b-[1px] border-[#797979] px-8 py-2  hover:bg-slate-300 cursor-pointer"
                >
                  <h1 className="font-montserrat font-medium capitalize">
                    {user?.fullName}
                  </h1>
                  <p className="font-hind text-xs">{user?.email}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="hidden"></div>
        )}
      </Modal>
    </div>
  );
}
