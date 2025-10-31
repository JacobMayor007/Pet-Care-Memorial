import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "@/app/firebase/config";

const signingIn = async (email: string, password: string) => {
  try {
    const auth = getAuth(app);

    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    alert("Invalid Credentials, or pending for approval");
    console.error(error);
    return false;
  }
};

export { signingIn };
