
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";

const createSuperAdmin = async () => {
  try {
    // Note: Firebase Authentication uses email, not username, for sign-in.
    const email = "appu@gmail.com";
    const password = "veedu1432";

    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Add user to 'superadmin' table in Realtime Database
    if (user) {
      await set(ref(db, 'superadmin/' + user.uid), {
        username: "appu",
        email: email,
        role: 'superadmin'
      });
      console.log("Super admin created successfully!");
    }
  } catch (error) {
    console.error("Error creating super admin:", error);
  }
};

createSuperAdmin();
