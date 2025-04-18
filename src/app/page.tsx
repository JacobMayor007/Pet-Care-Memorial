"use client";
import { useEffect, useState } from "react";
import isAuthenticate from "./fetchData/isAuthenticate";
import { useRouter } from "next/navigation";
import Navigation from "./MemorialNavigation/page";
import { Calendar, List, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase/config";
import fetchUserData from "./fetchData/fetchUserData";

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
}

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [myMemorial, setMyMemorial] = useState<MemorialAppointment[]>([]);
  const [todayMemorials, setTodayMemorials] = useState<MemorialAppointment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [memorialForDate, setMemorialForDate] = useState<MemorialAppointment[]>(
    []
  );
  const [newCustomer, setNewCustomer] = useState(0);
  const [oldCustomer, setOldCustomer] = useState(0);

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login");
      } else {
        setIsLoggedIn(true);
      }
    };

    checkAuthentication();
  }, [router]);

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
          where("memorial_service_provider_id", "==", userData[0]?.User_UID)
        );
        const docSnap = await getDocs(q);

        const rawResult = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const result = rawResult.map((memorial: MemorialAppointment) => ({
          ...memorial,
          memorial_service_createdAt: memorial?.memorial_service_createdAt
            ? dayjs(memorial.memorial_service_createdAt.toDate())
            : null,
          memorial_service_date: memorial?.memorial_service_date
            ? dayjs(memorial.memorial_service_date.toDate())
            : null,
        }));

        setMyMemorial(result);

        const today = result.filter((memorial) =>
          memorial.memorial_service_date?.isSame(dayjs(), "day")
        );

        setTodayMemorials(today);

        console.log("Today Memorials: ", today);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMyMemorial();
  }, [userData]);

  useEffect(() => {
    const myNewPatient = async () => {
      try {
        const customerRef = collection(db, "mourners");
        const q = query(
          customerRef,
          where("memorial_service_provider_id", "==", userData[0]?.User_UID)
        );
        const querySnapshot = await getDocs(q);

        let newCustomerCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.memorial_service_provider_id &&
            data.memorial_service_isNewCustomer === true
          ) {
            newCustomerCount++;
          }
        });

        setNewCustomer(newCustomerCount);
      } catch (err) {
        console.log(err);
        return 0;
      }
    };

    myNewPatient();
  }, [userData]);

  console.log("Today Memorials: ", todayMemorials);

  useEffect(() => {
    const myOldCustomer = async () => {
      try {
        const customerRef = collection(db, "mourners");
        const q = query(
          customerRef,
          where("memorial_service_provider_id", "==", userData[0]?.User_UID)
        );
        const querySnapshot = await getDocs(q);

        let oldCustomer = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.memorial_service_provider_id &&
            data.memorial_service_isNewCustomer === false
          ) {
            oldCustomer++;
          }
        });

        setOldCustomer(oldCustomer);
      } catch (err) {
        console.log(err);
        return 0;
      }
    };

    myOldCustomer();
  }, [userData]);

  const cellRender = (date: Dayjs) => {
    const memorialDate = myMemorial.filter((memorial) =>
      memorial.memorial_service_date?.isSame(date, "day")
    );

    const memorial = memorialDate[0];

    return (
      <div
        className="text-sm h-full flex justify-end"
        onClick={() => setModalOpen(true)}
      >
        {memorial && (
          <div
            className={`h-3 w-3 rounded-full  ${
              memorial.memorial_service_date?.isBefore(dayjs(), "day")
                ? "bg-green-500"
                : "bg-[#FF0000] animate-pulse"
            }`}
          />
        )}
      </div>
    );
  };

  const onDateSelect = (date: Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const appointmentsForDay = myMemorial.filter(
      (memorial) =>
        memorial?.memorial_service_date?.format("YYYY-MM-DD") === formattedDate
    );
    setMemorialForDate(appointmentsForDay);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <div></div>
      </div>
    );
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div>
      <nav className="relative z-20">
        <Navigation />
      </nav>
      <div className="ml-56 mr-48 grid grid-cols-7 gap-5 z-10">
        <h1 className="text-4xl font-bold font-montserrat text-[#393939] capitalize text-start col-span-7 mt-8"></h1>
        <div className="h-full pt-5 pb-10 col-span-3">
          <div className="flex flex-col gap-14">
            <div className="h-80 bg-gradient-to-t from-[#006B95] to-[#61C4EB] rounded-3xl p-10 w-full">
              <h1 className="font-montserrat font-bold text-2xl text-white">
                {" "}
                Total Memorials
                <p className="font-hind font-medium text-3xl text-[#00126A] mt-2">
                  {myMemorial.length}
                </p>
              </h1>
              <p className="font-hind font-medium text-3xl text-[#00126A] mt-2"></p>
              <div className="grid grid-cols-2  ">
                <div className="h-[135px] w-[151px] bg-[#D3EDF7] p-4 rounded-2xl flex flex-col gap-4">
                  <h1 className="font-montserrat font-semibold text-base">
                    New Customer
                  </h1>
                  <p className="font-hind font-medium text-[#00126A] text-4xl">
                    {newCustomer}
                  </p>
                </div>
                <div className="h-[135px] w-[151px] bg-[#D3EDF7] p-4 rounded-2xl flex flex-col gap-4">
                  <h1 className="font-montserrat font-semibold text-base">
                    Old Customer
                  </h1>
                  <p className="font-hind font-medium text-[#00126A] text-4xl">
                    {" "}
                    {oldCustomer}
                  </p>
                </div>
              </div>
            </div>
            <h1 className="font-montserrat font-semibold text-2xl text-[#393939]">
              Memorial Lists
            </h1>
            <div className="border-[1px] border-slate-300 rounded-md bg-white p-4 flex flex-col gap-4 drop-shadow-md min-h-52 max-h-[362px] overflow-y-scroll">
              <h1 className="font-montserrat font-bold text-lg text-[#393939] ">
                Today
              </h1>
              <div className="bg-slate-400 w-full h-0.5 rounded-full" />
              {todayMemorials?.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="grid grid-cols-5 items-center bg-white drop-shadow-md py-2 px-4 rounded-md"
                  >
                    <div className="h-9 w-9 rounded-full border-[1px] border-slate-300 capitalize text-xl flex justify-center items-center font-montserrat font-bold">
                      {data?.memorial_service_mourner_name?.charAt(0)}
                    </div>
                    <div className="col-span-3">
                      <h1 className="font-montserrat font-medium capitalize text-lg">
                        {data?.memorial_service_mourner_name}
                      </h1>
                      {data?.memorial_service_status === "isPending" && (
                        <p className="font-hind italic text-[#006B95] font-bold">
                          pending
                        </p>
                      )}
                    </div>
                    <div className="font-montserrat font-bold text-lg capitalize">
                      {data?.memorial_service_type}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className=" w-full col-span-4">
          <Calendar
            cellRender={cellRender}
            onSelect={onDateSelect}
            className="bg-white rounded-xl drop-shadow-xl h-fit px-10 pt-10 my-4 overflow-hidden calendar-no-scroll"
          />
          <Modal
            open={modalOpen}
            footer={null}
            centered={true}
            onClose={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
          >
            <List
              dataSource={memorialForDate}
              renderItem={(item, index) => (
                <List.Item key={item.id}>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-montserrat text-base">
                      Patient {index + 1}:
                    </h1>
                    <p className="font-montserrat font-bold text-lg text-[#393939] capitalize">
                      {item.memorial_service_mourner_name}
                    </p>
                    <h1 className="font-montserrat text-base">Pet:</h1>
                    <p className="font-montserrat font-bold text-lg text-[#393939]">
                      {item.memorial_service_petName}
                    </p>
                    <h1 className="font-montserrat text-base">Type:</h1>
                    <p className="font-montserrat font-bold text-lg text-[#393939] capitalize">
                      {item.memorial_service_type} Ceremony
                    </p>

                    {item.memorial_service_status === "Pending" && (
                      <h1 className="font-montserrat text-base">
                        Date wanted to appoint:{" "}
                      </h1>
                    )}

                    {/* <h1 className="font-montserrat text-base">
                      {item?.memorial_service_status === "isPending"
                        ? `Date Of Schedule want to Appoint:`
                        : item?.memorial_service_status === "Approved"
                        ? `Approved Schedule`
                        : ``}
                    </h1> */}
                    <p className="font-montserrat font-bold text-lg text-[#393939]">
                      {item.memorial_service_date?.format("MMMM DD, YYYY")}
                    </p>
                  </div>
                </List.Item>
              )}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="h-screen">
      <nav className="ml-72 gap-8 h-fit flex flex-row items-center  animate-pulse">
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-14 w-14" />
          <li className="bg-slate-300 h-10 w-32 drop-shadow-xl rounded-xl" />
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
        </ul>
      </nav>
      <div className="ml-56 mr-48 grid grid-cols-7 gap-5 py-10 h-full animate-pulse">
        <div className="col-span-3 py-10 h-full w-full flex flex-col gap-10">
          <div className="h-80 rounded-3xl w-full bg-slate-300"></div>
          <div className="col-span-4 w-full h-full rounded-3xl bg-slate-300"></div>
        </div>
      </div>
    </div>
  );
}
