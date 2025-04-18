"use client";

// import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import Loading from "@/app/Loading/page";
import Navigation from "@/app/MemorialNavigation/page";
import { Rate } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { useEffect, useState } from "react";

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
  const [myMemorial, setMyMemorial] = useState<MemorialAppointment | null>(
    null
  );
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
          <Rate
            className="m-auto"
            value={myMemorial?.memorial_service_rate_and_feedback?.rate}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
