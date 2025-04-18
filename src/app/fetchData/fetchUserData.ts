import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, where, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../firebase/config";

const fetchUserData = async (): Promise<DocumentData[]> => {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userEmail = user.email;
          const userUID = user.uid;
          // Query the Users collection with both conditions
          const userQuery = query(
            collection(db, "Users"),
            where("User_Email", "==", userEmail),
            where("User_UID", "==", userUID)
          );

          // Execute the query
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Extract all fields for the matching document(s)
            const userData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            resolve(userData);
            return userData;
          } else {
            console.log("No matching user found.");
            resolve([]);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          reject(error);
        }
      } else {
        console.log("No user is signed in.");
        resolve([]);
      }
    });
  });
};

export default fetchUserData;
