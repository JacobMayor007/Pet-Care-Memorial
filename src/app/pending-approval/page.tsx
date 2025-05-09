"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const PendingApproval = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Registration Submitted
        </h2>
        <p className="text-gray-700 mb-6">
          Your registration request has been submitted for admin approval.
          You&lsquo;ll receive an email once your account is approved.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;
