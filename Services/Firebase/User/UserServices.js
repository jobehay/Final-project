import { USER, defaultUser } from "../User/UserModel";
import * as Device from "expo-device";
import { MyCollections } from "../collectionNames";
import { findDocument, createDocument } from "../firebaseAPI";

export const getCurrentUser = async () => {
  try {
    const currentUser = await findDocument(
      MyCollections.USERS,
      USER.DEVICE_ID,
      Device.osInternalBuildId
    );

    return currentUser;
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
    return null;
  }
};

export const getCurrentUserOrCreateUser = async () => {
  try {
    let currentUser = await getCurrentUser();
    console.log("Current user :", currentUser);
    if (!currentUser) {
      const newUser = await createDocument(MyCollections.USERS, defaultUser);
      console.log("Create a new user", newUser);
      return newUser;
    }

    return currentUser;
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
    return null;
  }
};
