import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { fireDB, storage } from "../../configs/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

// Function to read documents in real-time
export const readDocumentsRealTime = (collectionName, callback) => {
  const collectionRef = collection(fireDB, collectionName);
  return onSnapshot(collectionRef, (snapshot) => {
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(docs);
  });
};

export const isCollectionEmpty = (querySnapshot) => {
  return querySnapshot.length === 0;
};

export const findDocument = async (
  collectionName,
  propertyName,
  propertyValue
) => {
  try {
    const querySnapshot = await getDocs(collection(fireDB, collectionName));
    let foundDocument = null;
    querySnapshot.forEach((doc) => {
      const documentData = doc.data();
      if (
        documentData.hasOwnProperty(propertyName) &&
        documentData[propertyName] === propertyValue
      ) {
        foundDocument = { id: doc.id, ...documentData };
      }
    });
    return foundDocument;
  } catch (error) {
    console.error("Error finding document: ", error);
    return null;
  }
};

export const uploadImage = async (uri, fileName) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    console.log("Image uploaded to: ", url);
    return url;
  } catch (error) {
    console.error("Error uploading image: ", error);
    return null;
  }
};
