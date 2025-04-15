"use client";
import { auth, provider } from "@/app/firebase/config";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { message, Modal, Select } from "antd";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getFirestore,
  doc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  faBowlRice,
  faChevronDown,
  faDove,
  faHandHoldingMedical,
  faHandshakeSimple,
  faHouseUser,
  faPaw,
} from "@fortawesome/free-solid-svg-icons";

export default function SignUp() {
  const [show, setShow] = useState(false);
  const [confirmShow, setConfirmShow] = useState(false);
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    memorialName: "",
    memorialAddress: "",
    typeOfPayment: [],
    memorialServices: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const [checkBox, setCheckBox] = useState(false);

  const paymentMethods = [
    {
      id: 0,
      label: "Cash On Hand",
      value: "Cash On Hand",
    },
    {
      id: 1,
      label: "GCash",
      value: "GCash",
    },
    {
      id: 2,
      label: "Debit Or Credit",
      value: "Debit Or Credit",
    },
  ];

  const services = [
    {
      id: 0,
      label: "Funeral Ceremony",
      value: "funeral",
    },
    {
      id: 1,
      label: "Cremation Ceremony",
      value: "cremation",
    },
  ];

  const [createUserWithEmailAndPassword, loading] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const db = getFirestore();

  const handleSignUp = async () => {
    const regex = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    if (isSubmitting) return;

    setIsSubmitting(true); // Prevent further clicks

    // Basic Validation
    if (
      !formData.fName ||
      !formData.lName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.memorialAddress ||
      !formData.memorialName ||
      !formData.memorialServices ||
      !formData.typeOfPayment ||
      !checkBox
    ) {
      alert("All fields are required.");
      setIsSubmitting(false); // Re-enable the button
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setIsSubmitting(false); // Re-enable the button
      return;
    }

    if (!regex.test(formData.password)) {
      alert("Please input atleast one special character, and one number");
    }

    if (!checkBox) {
      alert("Please check the terms and conditions");
      return;
    }

    try {
      const memorialRef = collection(db, "memorial");
      const q = query(
        memorialRef,
        where("mortician_email", "==", formData.email)
      );
      const memorialSnap = await getDocs(q);

      if (!memorialSnap.empty) {
        alert("This email is already registered. Please use another one.");
        throw new Error("This account is already in use");
      }

      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (!res || !res.user) {
        throw new Error("Failed to create user. Please try again.");
      }

      const userRef = doc(db, "Users", res.user.uid);
      await setDoc(userRef, {
        User_Name: formData.fName + formData.lName,
        User_Email: formData.email,
        User_UID: res.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });

      const memorialReg = doc(db, "memorial", res.user.uid);
      await setDoc(memorialReg, {
        mortician_uid: res.user.uid,
        mortician_email: formData.email,
        mortician_fullname: formData.fName + " " + formData.lName,
        mortician_contact: formData.contact,
        mortician_memorial_name: formData.memorialName,
        mortician_memorial_address: formData.memorialAddress,
        mortician_memorial_payments: formData.typeOfPayment,
        morticial_memorial_services: formData.memorialServices,
        TermsAndConditions: checkBox,
      });

      // Clear in
      setFormData({
        fName: "",
        lName: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: "",
        memorialName: "",
        memorialAddress: "",
        typeOfPayment: [],
        memorialServices: [],
      });

      router.push("/Login");
    } catch (error) {
      console.error(message, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleAuth = async () => {
    try {
      const memorialRef = collection(db, "memorial");
      const q = query(
        memorialRef,
        where("mortician_email", "==", formData.email)
      );
      const memorialSnap = await getDocs(q);

      if (!memorialSnap.empty) {
        alert("This email is already registered. Please use another one.");
        throw new Error("This account is already in use");
      }

      if (
        !formData.contact ||
        !formData.memorialAddress ||
        !formData.memorialName
      ) {
        alert("Please input all fields");
        return;
      }

      if (!checkBox) {
        alert("Please check the Terms, and Conditions");
        return new Error("Failed to create user. Please try again.");
      }

      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, "Users", result.user.uid);
      await setDoc(userRef, {
        User_Name: result.user.displayName,
        User_Email: result.user.email,
        User_UID: result.user.uid,
        CreatedAt: Timestamp.now(),
        TermsAndConditions: checkBox,
      });

      const memorialReg = doc(db, "memorial", result.user.uid);

      await setDoc(memorialReg, {
        mortician_uid: result.user.uid,
        mortician_email: formData.email,
        mortician_fullname: formData.fName + " " + formData.lName,
        mortician_contact: formData.contact,
        mortician_memorial_name: formData.memorialName,
        mortician_memorial_address: formData.memorialAddress,
        mortician_memorial_payments: formData.typeOfPayment,
        morticial_memorial_services: formData.memorialServices,
        TermsAndConditions: checkBox,
      });

      if (result) {
        router.push("/");
      } else {
        router.push("/Sign-Up");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const facebookAuth = async () => {
    try {
      const memorialRef = collection(db, "memorial");
      const q = query(
        memorialRef,
        where("mortician_email", "==", formData.email)
      );
      const memorialSnap = await getDocs(q);

      if (!memorialSnap.empty) {
        alert("This email is already registered. Please use another one.");
        throw new Error("This account is already in use");
      }

      if (
        !formData.contact ||
        !formData.memorialAddress ||
        !formData.memorialName
      ) {
        alert("Please input all fields");
        return;
      }

      if (!checkBox) {
        alert("Please check the Terms, and Conditions");
        return new Error("Failed to create user. Please try again.");
      }

      const result = await signInWithPopup(
        getAuth(),
        new FacebookAuthProvider()
      );
      const userRef = doc(db, "Users", result.user.uid);
      await setDoc(userRef, {
        User_Name: result.user.displayName,
        User_Email: result.user.email,
        User_UID: result.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });

      const memorialReg = doc(db, "memorial", result.user.uid);

      await setDoc(memorialReg, {
        mortician_uid: result.user.uid,
        mortician_email: result.user.email,
        mortician_fullname: result.user.displayName,
        mortician_contact: formData.contact,
        mortician_memorial_name: formData.memorialName,
        mortician_memorial_address: formData.memorialAddress,
        mortician_memorial_payments: formData.typeOfPayment,
        mortician_memorial_services: formData.memorialServices,
        TermsAndConditions: checkBox,
      });

      if (result) {
        router.push("/");
      } else {
        router.push("/Sign-Up");
      }
      console.log("Facebook Sign In", result);
    } catch (err) {
      console.log(err);
    }
  };

  console.log("Value of Checkbox: ", checkBox);
  console.log("Type Of Payment: ", formData.typeOfPayment);
  console.log("Memorial Services: ", formData.memorialServices);

  return (
    <>
      <div className="xl:h-screen 2xl:h-screen bg-signUp flex flex-row">
        <div className="w-[30%]">
          <h1 className="text-5xl font-sigmar font-normal text-white mt-20 text-center">
            Pet Care Pro
          </h1>
          <Image
            src="/Logo.svg"
            width={626}
            height={650}
            alt="Logo Icon"
            className="object-contain mt-8"
          />
        </div>
        <div className="w-[70%] rounded-[25px_0px_0px_25px] z-[2] bg-white flex flex-col px-20 gap-7">
          <div className="mt-14 flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/PawPrint.svg"
                height={50}
                width={50}
                alt="Paw Print Icon"
              />
              <h1 className="text-3xl font-montserrat font-bold">
                Pet Memorial Registration
              </h1>
            </div>
            <RegisterAs />
          </div>
          <form
            className="flex flex-col gap-6 z-10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className="grid grid-cols-2 gap-10">
              <div className="relative">
                <label
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                  htmlFor="fName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="fName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.fName}
                  onChange={(e) =>
                    setFormData({ ...formData, fName: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <label
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="last name"
                  id="lName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.lName}
                  onChange={(e) =>
                    setFormData({ ...formData, lName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-10">
              <div className="relative col-span-3">
                <label
                  htmlFor="emailsignup"
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email-id"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="relative border-solid border-black rounded-md border-[1px] pl-1 pr-2 flex flex-row items-center col-span-2">
                <label
                  htmlFor="contact-id"
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                >
                  Contact Number
                </label>
                <p className="mx-2  bg-white py-1 px-1 font-montserrat font-medium drop-shadow-md rounded-md">
                  +63
                </p>
                <input
                  type="text"
                  name="contact"
                  id="contact-id"
                  onKeyDown={(event) => {
                    if (
                      event.key == "." ||
                      event.key === "-" ||
                      event.key === "e"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="h-12 w-full outline-none rounded-md font-hind text-base px-2"
                  value={formData.contact}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.length <= 10) {
                      setFormData({ ...formData, contact: inputValue });
                    } else {
                      setFormData({
                        ...formData,
                        contact: inputValue.slice(0, 10),
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                >
                  Password
                </label>
                <input
                  type={show ? `text` : `password`}
                  name="password"
                  id="password"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.password}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={show ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    className="object-contain cursor-pointer"
                    draggable={false}
                    onClick={() => setShow((prev) => !prev)}
                  />
                </div>
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-7 -top-2 bg-white text-sm font-hind"
                >
                  Confirm Password
                </label>
                <input
                  type={confirmShow ? `text` : `password`}
                  name="confirm password"
                  id="confirmPassword"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={confirmShow ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    draggable={false}
                    className="object-contain cursor-pointer"
                    onClick={() => setConfirmShow((prev) => !prev)}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                >
                  Memorial Name
                </label>
                <input
                  type={`text`}
                  name="memorial-name"
                  id="memorial-name-id"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.memorialName}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({ ...formData, memorialName: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-7 -top-2 bg-white text-sm font-hind"
                >
                  Memorial Address
                </label>
                <input
                  type={`text`}
                  name="memorial-address"
                  id="memorial-address-id"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.memorialAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memorialAddress: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <Select
                allowClear
                className="h-10"
                mode="multiple"
                onChange={(value) =>
                  setFormData({ ...formData, typeOfPayment: value })
                }
                options={paymentMethods}
                placeholder="Select Type Of Payment"
              />
              <Select
                allowClear
                className="h-10"
                mode="multiple"
                onChange={(value) =>
                  setFormData({ ...formData, memorialServices: value })
                }
                options={services}
                placeholder="Select Type Of Memorial Services"
              />
            </div>

            <div className="flex flex-row gap-3">
              <input
                type="checkbox"
                name="agree"
                id="agreeTandT"
                className="w-6 h-6 text-base font-hind px-2 cursor-pointer"
                checked={checkBox}
                onChange={() => setCheckBox((prev) => !prev)}
              />
              <label htmlFor="agreeTandT" className="cursor-pointer">
                I agree to the{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Conditions
                </span>
              </label>
            </div>
            <div>
              <button
                type="submit"
                id="signup-button"
                className={`w-[200px] h-[50px] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6BE8DC] hover:bg-blue-400"
                } text-[22px] font-montserrat font-bold text-white rounded-lg`}
                disabled={Boolean(isSubmitting || loading)}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>
          <div>
            <p>
              Already have an account?{" "}
              <span className="text-base font-hind text-[#4ABEC5]">
                <Link href="/Login">Log in here</Link>
              </span>
            </p>
          </div>
          <div className="w-[600px] h-20 grid grid-cols-3 gap-4">
            <div
              className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
              onClick={googleAuth}
            >
              <GoogleOutlined className="text-4xl text-green-500" />
              <h1 className="text-2xl font-hind">Google</h1>
            </div>
            <div
              className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
              onClick={facebookAuth}
            >
              <FacebookOutlined className="text-4xl text-blue-500" />
              <h1 className="text-2xl font-hind">Facebook</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const RegisterAs = () => {
  const [signUpAs, setSignUpAs] = useState(false);

  const registerAsData = [
    {
      key: 0,
      label: "Pet Owner",
      icon: faPaw,
      route: "/Sign-Up",
    },
    {
      key: 1,
      label: "Pet Product Seller",
      icon: faHandshakeSimple,
      route: "https://seller-pet-care-pro.vercel.app/Sign-Up-Seller",
    },
    {
      key: 2,
      label: "Pet Veterinarian",
      icon: faHandHoldingMedical,
      route: "https://doctor-pet-care-pro.vercel.app",
    },
    {
      key: 3,
      label: "Pet Sitting Services",
      icon: faBowlRice,
      route: "/Sitter",
    },
    {
      key: 4,
      label: "Pet Memorial",
      icon: faDove,
      route: "/Funeral",
    },

    {
      key: 5,
      label: "Pet Boarding Services",
      icon: faHouseUser,
      route: "https://boarding-pet-care-pro.vercel.app/Sign-Up-Boarding",
    },
  ];
  return (
    <div>
      <div className="relative z-20 border-2 cursor-pointer font-medium font-montserrat border-gray-300 rounded-lg drop-shadow-md w-fit gap-2 text-center h-10 flex items-center ">
        <div
          onClick={() => setSignUpAs((prev) => !prev)}
          className=" w-full gap-2 text-center h-10 flex items-center px-2"
        >
          Register As?
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
      <Modal
        open={signUpAs}
        centered
        onClose={() => setSignUpAs(false)}
        onCancel={() => setSignUpAs(false)}
        footer={null}
      >
        <div className="grid grid-cols-3 gap-5 m-5">
          {registerAsData.map((data) => (
            <Link
              href={data.route}
              key={data.key}
              className="font-hind font-medium h-24 cursor-pointer text-center hover:text-white"
              onClick={() => setSignUpAs(false)}
            >
              <div className=" border-2 hover:bg-[#006B95] font-montserrat font-bold text-[#466571] rounded-md border-[#006B95] hover:text-white h-full flex flex-col items-center justify-center">
                <FontAwesomeIcon
                  icon={data?.icon}
                  className={`text-2xl text-[#ADD8E6]`}
                />

                {data?.label}
              </div>
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  );
};
