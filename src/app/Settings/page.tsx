"use client";

import { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import { signOut, updatePassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Navigation from "../MemorialNavigation/page";

export default function Settings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successful) {
      timer = setTimeout(() => {
        setSuccessful(false);
        signOut(auth);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [successful]);

  const updateHandle = async () => {
    try {
      const regex = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;

      setIsUpdating(true);

      if (newPassword !== confirmNewPassword) {
        alert("Passwords do not match!");
        setIsUpdating(false);
        return;
      }

      if (!regex.test(newPassword)) {
        alert(
          "Password must be at least 8 characters long and contain at least one special character and one number"
        );
        setIsUpdating(false);
        return;
      }

      if (user) {
        await updatePassword(user, newPassword);
        setSuccessful(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error updating password. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (successful) {
    return (
      <div className="h-screen">
        <div className="flex flex-row items-center justify-center mt-32 gap-4">
          <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center p-1">
            <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
              <FontAwesomeIcon icon={faCheck} className="text-white h-14" />
            </div>
          </div>
          <h1 className="font-montserrat font-bold text-3xl">
            Password Updated Successfully!
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <nav className="z-20 relative">
        <Navigation />
      </nav>
      <h1 className="font-montserrat font-bold text-[#393939] mx-56 text-3xl my-8">
        Settings
      </h1>
      <div className="h-screen mx-56 grid grid-cols-6">
        <div className="col-span-2"></div>
        <div className="col-span-4">
          <h1 className="font-montserrat font-bold text-[#006B95]">
            Change Password
          </h1>
          <div className="my-8 grid grid-cols-4 gap-4 items-center">
            <label
              htmlFor="newPassword"
              className="font-montserrat font-bold mx-auto"
            >
              New Password:
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 rounded-md border-[1px] border-slate-300 outline-none px-2 font-hind text-[#393939]"
            />
            <label
              htmlFor="confirmPassword"
              className="font-montserrat font-bold mx-auto"
            >
              Confirm Password:
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="h-10 rounded-md border-[1px] border-slate-300 outline-none px-2 font-hind text-[#393939]"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={updateHandle}
              disabled={isUpdating}
              className="bg-[#006B95] font-montserrat font-bold text-white px-6 py-2 rounded-lg active:scale-95 disabled:opacity-70"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
