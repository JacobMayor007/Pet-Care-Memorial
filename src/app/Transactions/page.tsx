"use client";

import dayjs, { Dayjs } from "dayjs";
import Navigation from "../MemorialNavigation/page";
import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import "@ant-design/v5-patch-for-react-19";

import { db } from "../firebase/config";
import fetchUserData from "../fetchData/fetchUserData";
import Loading from "../Loading/page";
import { Modal, Rate, TimePicker } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface MemorialAppointment {
  id?: string;
  memorial_service_createdAt?: Dayjs | null;
  memorial_service_date?: Dayjs | null;
  memorial_service_isNewCustomer?: string;
  memorial_service_mourner_email?: string;
  memorial_service_mourner_name?: string;
  memorial_service_mourner_id?: string;
  memorial_service_status?: string;
  memorial_service_payment?: string;
  memorial_service_petName?: string;
  memorial_service_provider_address?: string;
  memorial_service_provider_contact?: string;
  memorial_service_provider_email?: string;
  memorial_service_provider_fullname?: string;
  memorial_service_provider_id?: string;
  memorial_service_provider_memorial_name?: string;
  memorial_service_type?: string;
  memorial_service_rate_and_feedback?: {
    feedback?: string;
    rate?: number;
  };
}

export default function Transactions() {
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [myMemorial, setMyMemorial] = useState<MemorialAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [filter, setFilter] = useState("Pending");
  const [dropdownFilter, setDropdownFilter] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [time, setTime] = useState<Dayjs | null>(null);
  const [approvedUser, setApprovedUser] = useState<MemorialAppointment | null>(
    null
  );
  const [paidModal, setPaidModal] = useState(false);
  const [successful, setSuccessful] = useState(false);

  const filterWords = [
    {
      id: 0,
      label: "Pending",
      value: "Pending",
    },
    {
      id: 1,
      label: "Approved",
      value: "Approved",
    },
    {
      id: 2,
      label: "Paid",
      value: "Paid",
    },
  ];

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!dropDownRef.current?.contains(e.target as Node)) {
        setDropdownFilter(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [dropdownFilter]);

  useEffect(() => {
    const getUserData = async () => {
      const result = await fetchUserData();
      setUserData(result);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyMemorial = async () => {
      try {
        const docRef = collection(db, "mourners");
        const q = query(
          docRef,
          where("memorial_service_provider_id", "==", userData[0]?.User_UID),
          where("memorial_service_status", "==", filter)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const result: MemorialAppointment[] = querySnapshot.docs.map(
            (doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                memorial_service_createdAt: data?.memorial_service_createdAt
                  ? dayjs(data.memorial_service_createdAt.toDate())
                  : null,
                memorial_service_date: data?.memorial_service_date
                  ? dayjs(data.memorial_service_date.toDate())
                  : null,
              };
            }
          );

          setMyMemorial(result);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMyMemorial();
  }, [userData, filter]);

  if (loading) {
    return <Loading />;
  }

  const paidHandle = async () => {
    try {
      const docRef = doc(db, "mourners", approvedUser?.id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          memorial_service_status: "Paid",
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          memorial_id: approvedUser?.id,
          receiverID: approvedUser?.memorial_service_mourner_id,
          senderID: userData[0]?.User_UID,
          receiver_fullName: approvedUser?.memorial_service_mourner_name,
          sender_fullname: userData[0]?.User_Name,
          message: `${
            userData[0]?.User_Name
          } have received your payment on your memorial at ${approvedUser?.memorial_service_date?.format(
            "MMMM DD, YYYY"
          )}. Please rate ${userData[0]?.User_Name} its services`,
          open: false,
          status: "unread",
          hide: false,
          title: "memorial",
        });

        setSuccessful(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const rejectHandle = async () => {
    try {
      const docRef = doc(db, "mourners", approvedUser?.id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          memorial_service_status: "Rejected",
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          memorial_id: approvedUser?.id,
          receiverID: approvedUser?.memorial_service_mourner_id,
          senderID: userData[0]?.User_UID,
          receiver_fullName: approvedUser?.memorial_service_mourner_name,
          sender_fullname: userData[0]?.User_Name,
          message: `${
            userData[0]?.User_Name
          } rejected to have memorial on ${approvedUser?.memorial_service_date?.format(
            "MMMM DD, YYYY"
          )}`,
          open: false,
          status: "unread",
          hide: false,
          title: "memorial",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approvedHandle = async () => {
    try {
      const docRef = doc(db, "mourners", approvedUser?.id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          memorial_service_status: "Approved",
          memorial_service_time: time
            ? Timestamp.fromDate(time.toDate())
            : null,
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          memorial_id: approvedUser?.id,
          receiverID: approvedUser?.memorial_service_mourner_id,
          senderID: userData[0]?.User_UID,
          receiver_fullName: approvedUser?.memorial_service_mourner_name,
          sender_fullname: userData[0]?.User_Name,
          message: `${
            userData[0]?.User_Name
          } approved to have memorial on ${approvedUser?.memorial_service_date?.format(
            "MMMM DD, YYYY"
          )}, at ${time?.format("hh:mm A")}`,
          open: false,
          status: "unread",
          hide: false,
          title: "memorial",
        });
        setSuccessful(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (successful) {
    setInterval(() => {
      setSuccessful(false);
    }, 1500);
    return (
      <div className="h-screen ">
        <div className="flex flex-row items-center justify-center mt-32 gap-4 animate-bounce ease-in-out transform-gpu duration-1000">
          <div className=" h-24 w-24 bg-white rounded-full flex items-center justify-center p-1">
            <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
              <FontAwesomeIcon icon={faCheck} className="text-white h-14" />{" "}
            </div>
          </div>
          <h1 className="font-montserrat font-bold text-3xl">Succeful!</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-full">
      <nav className="relative z-20">
        <Navigation />
      </nav>
      <div
        ref={dropDownRef}
        className="my-16 flex flex-row justify-between mx-56"
      >
        <h1 className="text-[#393939] text-2xl font-montserrat font-bold">
          List Of Transactions
        </h1>
        <button
          onClick={() => setDropdownFilter((prev) => !prev)}
          className="bg-[#006B95] text-white flex active:scale-95 flex-row gap-4 items-center justify-center font-montserrat font-bold w-28 h-10 rounded-3xl "
        >
          {filter}
        </button>
        {dropdownFilter && (
          <div className="absolute z-20 drop-shadow-md p-2 rounded-md flex flex-col gap-2 justify-center right-52 top-48 bg-white w-32">
            {filterWords.map((data, index) => {
              return (
                <h1
                  key={index}
                  onClick={() => {
                    setFilter(data?.value);
                    setDropdownFilter(false);
                  }}
                  className=" text-center py-2 border-b-[1px] border-slate-300 cursor-pointer"
                >
                  {data.label}
                </h1>
              );
            })}
          </div>
        )}
      </div>
      {filter === "Pending" && (
        <div className="mx-56 flex flex-col gap-5">
          {myMemorial.map((data, index) => {
            return (
              <div
                key={index}
                className="rounded-xl drop-shadow-md bg-white h-56 grid grid-cols-4 gap-4"
              >
                <div className="h-32 w-32 rounded-full border-[1px] capitalize font-montserrat font-bold text-2xl m-auto flex justify-center items-center border-slate-300">
                  {data?.memorial_service_mourner_name?.charAt(0)}
                </div>
                <div className="flex flex-col justify-center col-span-2">
                  <h1 className="font-montserrat font-bold capitalize text-lg text-[#393939]">
                    Customer Name: {data?.memorial_service_mourner_name}
                  </h1>
                  <h1 className="font-montserrat capitalize text-lg text-[#393939]">
                    On: {data?.memorial_service_date?.format("MMMM DD, YYYY")}
                  </h1>
                  <h1 className="font-montserrat ">
                    Service Type:{" "}
                    <span className="font-bold text-[#006B95] capitalize">
                      {data?.memorial_service_type} Ceremony
                    </span>
                  </h1>
                </div>
                <div className="m-auto flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setApproveModal(true);
                      setApprovedUser(data);
                    }}
                    className="m-auto bg-[#006B95] text-white h-12 w-48 rounded-md font-hind font-bold text-xl active:scale-95"
                  >
                    Click to approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectModal(true);
                      setApprovedUser(data);
                    }}
                    className="m-auto bg-[#006B95] text-white h-12 w-48 rounded-md font-hind font-bold text-xl active:scale-95"
                  >
                    Click to reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filter === "Approved" && (
        <div className="mx-56 flex flex-col gap-5">
          {myMemorial.map((data, index) => {
            return (
              <div
                key={index}
                className="rounded-xl drop-shadow-md bg-white h-56 grid grid-cols-4 gap-4"
              >
                <div className="h-32 w-32 rounded-full border-[1px] capitalize font-montserrat font-bold text-2xl m-auto flex justify-center items-center border-slate-300">
                  {data?.memorial_service_mourner_name?.charAt(0)}
                </div>
                <div className="flex flex-col justify-center col-span-2">
                  <h1 className="font-montserrat font-bold capitalize text-lg text-[#393939]">
                    Customer Name: {data?.memorial_service_mourner_name}
                  </h1>
                  <h1 className="font-montserrat capitalize text-lg text-[#393939]">
                    On: {data?.memorial_service_date?.format("MMMM DD, YYYY")}
                  </h1>
                  <h1 className="font-montserrat ">
                    Service Type:{" "}
                    <span className="font-bold text-[#006B95] capitalize">
                      {data?.memorial_service_type} Ceremony
                    </span>
                  </h1>
                </div>
                <div className="m-auto flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setPaidModal(true);
                      setApprovedUser(data);
                    }}
                    className="m-auto bg-[#006B95] text-white h-12 w-52 rounded-md font-hind font-bold text-xl active:scale-95"
                  >
                    Clicked if have paid
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filter === "Paid" && (
        <div className="mx-56 flex flex-col gap-5">
          {myMemorial.map((data, index) => {
            return (
              <div
                key={index}
                className="rounded-xl drop-shadow-md bg-white h-56 grid grid-cols-4 gap-4"
              >
                <div className="h-32 w-32 rounded-full border-[1px] capitalize font-montserrat font-bold text-2xl m-auto flex justify-center items-center border-slate-300">
                  {data?.memorial_service_mourner_name?.charAt(0)}
                </div>
                <div className="flex flex-col justify-center col-span-2">
                  <h1 className="font-montserrat font-bold capitalize text-lg text-[#393939]">
                    Customer Name: {data?.memorial_service_mourner_name}
                  </h1>
                  <h1 className="font-montserrat capitalize text-lg text-[#393939]">
                    On: {data?.memorial_service_date?.format("MMMM DD, YYYY")}
                  </h1>
                  <h1 className="font-montserrat ">
                    Service Type:{" "}
                    <span className="font-bold text-[#006B95] capitalize">
                      {data?.memorial_service_type} Ceremony
                    </span>
                  </h1>
                </div>
                <div className="m-auto flex flex-col gap-2">
                  {data?.memorial_service_rate_and_feedback?.rate ? (
                    <Rate
                      value={data?.memorial_service_rate_and_feedback.rate}
                      disabled
                    />
                  ) : (
                    <h1 className="text-[#393939] font-hind italic">
                      <span className="capitalize font-montserrat font-bold text-[#006B95]">
                        {data?.memorial_service_mourner_name}
                      </span>{" "}
                      is rating your service, please wait a moment!
                    </h1>
                  )}{" "}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={approveModal}
        onCancel={() => setApproveModal(false)}
        onClose={() => setApproveModal(false)}
        onOk={() => {
          approvedHandle();
          setApproveModal(false);
        }}
        centered
      >
        <h1 className="font-hind text-[#393939] font-medium text-base">
          Do you want to approved the appointment of{" "}
          <span className="capitalize font-montserrat font-bold text-[#006B95]">
            {approvedUser?.memorial_service_mourner_name}
          </span>
        </h1>
        <div className="flex flex-col my-4">
          <label
            htmlFor="time-id"
            className="font-montserrat font-bold text-[#393939]"
          >
            Input time on{" "}
            <span className="text-[#006B95] italic">
              {approvedUser?.memorial_service_date?.format("MMMM DD, YYYY")}
            </span>
          </label>
          <TimePicker
            format={"hh:mm A"}
            use12Hours
            className="w-1/2"
            onChange={(time: dayjs.Dayjs | null) => setTime(time)}
          />
        </div>
      </Modal>
      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        onClose={() => setRejectModal(false)}
        onOk={() => {
          rejectHandle();
          setRejectModal(false);
        }}
        centered
      >
        <h1 className="font-hind text-[#393939] font-medium text-base">
          Do you want to reject the appointment of{" "}
          <span className="capitalize font-montserrat font-bold text-[#006B95]">
            {approvedUser?.memorial_service_mourner_name}
          </span>
        </h1>
      </Modal>

      <Modal
        open={paidModal}
        onCancel={() => setPaidModal(false)}
        onClose={() => setPaidModal(false)}
        onOk={() => {
          paidHandle();
          setPaidModal(false);
        }}
        centered
      >
        <h1 className="font-hind text-base">
          Confirming payment of{" "}
          <span className="font-montserrat font-bold text-[#006B95] capitalize">
            {approvedUser?.memorial_service_mourner_name}?
          </span>
        </h1>
      </Modal>
    </div>
  );
}
