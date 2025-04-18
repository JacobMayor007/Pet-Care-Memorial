"use client";

import dayjs, { Dayjs } from "dayjs";
import Navigation from "../MemorialNavigation/page";
import { useEffect, useRef, useState } from "react";
import {
  collection,
  DocumentData,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import fetchUserData from "../fetchData/fetchUserData";
import Loading from "../Loading/page";

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

export default function Customers() {
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [myMemorial, setMyMemorial] = useState<MemorialAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [filter, setFilter] = useState("Pending");
  const [dropdownFilter, setDropdownFilter] = useState(false);

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

  console.log(myMemorial);

  return (
    <div className="h-screen max-h-full">
      <nav>
        <Navigation />
      </nav>
      <div className="my-16 flex flex-row justify-between mx-56">
        <h1 className="text-[#393939] text-2xl font-montserrat font-bold">
          List Of My Customers
        </h1>
        <button
          onClick={() => setDropdownFilter((prev) => !prev)}
          className="bg-[#006B95] text-white font-montserrat font-bold w-28 h-10 rounded-md"
        >
          {filter}
        </button>
        {dropdownFilter && (
          <div
            ref={dropDownRef}
            className="absolute z-20 drop-shadow-md p-2 rounded-md flex flex-col gap-2 justify-center right-52 top-48 bg-white w-32"
          >
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
              <div className="m-auto text-[#006B95] font-hind italic font-bold text-xl">
                {data?.memorial_service_status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
