import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { fireDB } from "../../configs/firebase";

// Function to create a document in a specified collection
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(fireDB, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    return null;
  }
};

// Function to read all documents from a specified collection
export const readDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(fireDB, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};

// Function to update a document in a specified collection
export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(fireDB, collectionName, docId), data);
    console.log("Document successfully updated!");
    return true;
  } catch (error) {
    console.error("Error updating document: ", error);
    return false;
  }
};

// Function to delete a document from a specified collection
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(fireDB, collectionName, docId));
    console.log("Document successfully deleted!");
    return true;
  } catch (error) {
    console.error("Error deleting document: ", error);
    return false;
  }
};

export const isCollectionEmpty = (querySnapshot) => {
  return querySnapshot.length;
};
