import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "../../AppStyles";
import { pickImageAndUpload } from "../../Services/Firebase/Image/ImageServices";
import { uploadImage } from "../../Services/Firebase/firebaseAPI";
import { useTranslation } from "react-i18next";

const AddItemModal = ({
  visible,
  onClose,
  newItemName,
  setNewItemName,
  addItemToCategory,
}) => {
  const [imagePath, setImagePath] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      setImagePath(null);
      setErrorMessage("");
      setLoading(false);
    }
  }, [visible]);

  const handlePickImage = async () => {
    if (loading) return;
    const imagePath = await pickImageAndUpload();
    console.log("Image path: ", imagePath);
    if (imagePath) {
      setImagePath(imagePath);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !imagePath) {
      setErrorMessage(t("itemImageNameRequired"));
      return;
    }

    setLoading(true);

    try {
      const timestamp = Date.now();
      const fileName = `${newItemName}_${timestamp}`;
      console.log("Add item clicked with file name: ", fileName);

      const imageUrl = await uploadImage(imagePath, fileName);
      console.log("Image URL: ", imageUrl);

      addItemToCategory({ name: newItemName, image: imageUrl });
      setErrorMessage(""); // Clear error message after successful addition
      onClose(); // Close the modal after adding the item
    } catch (error) {
      setErrorMessage(t("failedToAddItem"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.imageContainer}
          >
            <Image
              source={
                imagePath
                  ? { uri: imagePath }
                  : require("../../assets/default-image.png")
              }
              style={styles.image}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newItemName}
            onChangeText={setNewItemName}
            placeholder={t("newItemName")}
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <>
              <TouchableOpacity
                onPress={handleAddItem}
                style={[styles.modalButton, styles.addButton]}
              >
                <Text style={styles.buttonText}>{t("addItem")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    width: "80%",
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  imageContainer: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: "80%",
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 20,
  },
});

export default AddItemModal;
