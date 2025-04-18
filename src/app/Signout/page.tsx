import { auth } from "../firebase/config";
import Link from "next/link";

export default function Signout() {
  return (
    auth.currentUser && (
      <button
        className="w-44 h-10 font-hind tracking-wide rounded-md drop-shadow-lg"
        onClick={() => {
          auth
            .signOut()
            .then(() => {
              localStorage.clear();
            })
            .catch((error) => {
              console.error("Error signing out: ", error);
            });
        }}
      >
        <Link href="/Login">Sign Out</Link>
      </button>
    )
  );
}
