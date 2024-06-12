import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Platform } from "react-native";
import { getStorage } from "firebase/storage";

import {
  readDocuments,
  isCollectionEmpty,
  deleteDocument,
  updateDocument,
  createDocument,
} from "../Services/Firebase/firebaseAPI";
import { MyCollections } from "../Services/Firebase/collectionNames";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "communivoice-bea29",
  storageBucket: "communivoice-bea29.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    Platform.OS === "ios"
      ? process.env.IOS_REACT_APP_FIREBASE_APP_ID
      : process.env.ANRDOID_REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const fireDB = getFirestore(app);
export const storage = getStorage(app);

export default app;

// Function to test Firestore connection by fetching some data
export const testFirestoreConnection = async () => {
  try {
    const querySnapshot = await readDocuments(MyCollections.TESTCOLLECTION);

    // Check if there are any documents in the collection
    if (isCollectionEmpty(querySnapshot)) {
      console.log("Connection to Firestore successful!");
    } else {
      console.log("No documents found in Firestore.");
    }

    // const deleteDoc = await deleteDocument(
    //   "testCollection",
    //   "emS2CtpEsylXQ8mAnQQO"
    // );

    // const updatedDoc = await updateDocument(
    //   "testCollection",
    //   "jK6QOylTGS9wojxXrxlh",
    //   { asd: "aya" }
    // );

    // const createDoc = await createDocument("testCollection", {
    //   Name: "Omar",
    //   Age: 1,
    // });
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
  }
};
