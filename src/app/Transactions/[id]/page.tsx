"use client";

// import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import Loading from "@/app/Loading/page";
import Navigation from "@/app/MemorialNavigation/page";
import { Modal, Rate, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  memorial_service_rate_and_feedback?: {
    feedback?: string;
    rate?: number;
  };
  memorial_service_type?: string;
}

interface MemorialID {
  params: Promise<{ id: string }>;
}

export default function TransactionCustomer({ params }: MemorialID) {
  const { id } = React.use(params);
  const [successful, setSuccessful] = useState(false);
  const [paidModal, setPaidModal] = useState(false);

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [myMemorial, setMyMemorial] = useState<MemorialAppointment | null>(
    null
  );
  const [time, setTime] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(true);
  // const [userData, setUserData] = useState<DocumentData[]>([]);

  // useEffect(() => {
  //   const getUserData = async () => {
  //     const result = await fetchUserData();
  //     setUserData(result);
  //   };
  //   getUserData();
  // }, []);

  useEffect(() => {
    const getMyMemorial = async () => {
      try {
        const docRef = doc(db, "mourners", id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          const result = {
            id: docSnap.id,
            ...data,
            memorial_service_date: data?.memorial_service_date
              ? dayjs(data?.memorial_service_date.toDate())
              : null,
            memorial_service_createdAt: data?.memorial_service_createdAt
              ? dayjs(data?.memorial_service_createdAt.toDate())
              : null,
          } as MemorialAppointment;

          setMyMemorial(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMyMemorial();
  }, [id]);

  const paidHandle = async () => {
    try {
      const docRef = doc(db, "mourners", myMemorial?.id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          memorial_service_status: "Paid",
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          memorial_id: myMemorial?.id,
          receiverID: myMemorial?.memorial_service_mourner_id,
          senderID: myMemorial?.memorial_service_provider_id,
          receiver_fullName: myMemorial?.memorial_service_mourner_name,
          sender_fullname: myMemorial?.memorial_service_provider_fullname,
          message: `${
            myMemorial?.memorial_service_provider_fullname
          } have received your payment on your memorial at ${myMemorial?.memorial_service_date?.format(
            "MMMM DD, YYYY"
          )}. Please rate ${
            myMemorial?.memorial_service_provider_fullname
          } its services`,
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
      const docRef = doc(db, "mourners", myMemorial?.id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          memorial_service_status: "Rejected",
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          memorial_id: myMemorial?.id,
          receiverID: myMemorial?.memorial_service_mourner_id,
          senderID: myMemorial?.memorial_service_provider_id,
          receiver_fullName: myMemorial?.memorial_service_mourner_name,
          sender_fullname: myMemorial?.memorial_service_provider_fullname,
          message: `${
            myMemorial?.memorial_service_provider_fullname
          } rejected to have memorial on ${myMemorial?.memorial_service_date?.format(
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
      const docRef = doc(db, "mourners", myMemorial?.id || "");
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
          memorial_id: myMemorial?.id,
          receiverID: myMemorial?.memorial_service_mourner_id,
          senderID: myMemorial?.memorial_service_provider_id,
          receiver_fullName: myMemorial?.memorial_service_mourner_name,
          sender_fullname: myMemorial?.memorial_service_provider_fullname,
          message: `${
            myMemorial?.memorial_service_provider_fullname
          } approved to have memorial on ${myMemorial?.memorial_service_date?.format(
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
          <h1 className="font-montserrat font-bold text-3xl">Successful!</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <nav className="relative z-20">
        <Navigation />
      </nav>
      <div className="mx-56 flex flex-col gap-5 my-16">
        <div className="rounded-xl drop-shadow-md bg-white h-56 grid grid-cols-4 gap-4">
          <div className="h-32 w-32 rounded-full border-[1px] capitalize font-montserrat font-bold text-2xl m-auto flex justify-center items-center border-slate-300">
            {myMemorial?.memorial_service_mourner_name?.charAt(0)}
          </div>
          <div className="flex flex-col justify-center col-span-2">
            <h1 className="font-montserrat font-bold capitalize text-lg text-[#393939]">
              Customer Name: {myMemorial?.memorial_service_mourner_name}
            </h1>
            <h1 className="font-montserrat capitalize text-lg text-[#393939]">
              On: {myMemorial?.memorial_service_date?.format("MMMM DD, YYYY")}
            </h1>
            <h1 className="font-montserrat ">
              Service Type:{" "}
              <span className="font-bold text-[#006B95] capitalize">
                {myMemorial?.memorial_service_type} Ceremony
              </span>
            </h1>
          </div>
          {myMemorial?.memorial_service_status === "isPending" && (
            <div className="m-auto flex flex-col gap-2">
              <button
                onClick={() => {
                  setApproveModal(true);
                }}
                className="m-auto bg-[#006B95] text-white h-12 w-48 rounded-md font-hind font-bold text-xl active:scale-95"
              >
                Click to approve
              </button>
              <button
                onClick={() => {
                  setRejectModal(true);
                }}
                className="m-auto bg-[#006B95] text-white h-12 w-48 rounded-md font-hind font-bold text-xl active:scale-95"
              >
                Click to reject
              </button>
            </div>
          )}
          {myMemorial?.memorial_service_status === "Approved" && (
            <div className="m-auto flex flex-col gap-2">
              <button
                onClick={() => {
                  setPaidModal(true);
                }}
                className="m-auto bg-[#006B95] text-white h-12 w-52 rounded-md font-hind font-bold text-xl active:scale-95"
              >
                Clicked here if paid
              </button>
            </div>
          )}
          {myMemorial?.memorial_service_status === "Paid" && (
            <Rate
              className="m-auto"
              value={myMemorial?.memorial_service_rate_and_feedback?.rate}
              disabled
            />
          )}
        </div>
      </div>
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
            {myMemorial?.memorial_service_mourner_name}
          </span>
        </h1>
        <div className="flex flex-col my-4">
          <label
            htmlFor="time-id"
            className="font-montserrat font-bold text-[#393939]"
          >
            Input time on{" "}
            <span className="text-[#006B95] italic">
              {myMemorial?.memorial_service_date?.format("MMMM DD, YYYY")}
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
            {myMemorial?.memorial_service_mourner_name}
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
            {myMemorial?.memorial_service_mourner_name}?
          </span>
        </h1>
      </Modal>
    </div>
  );
}
