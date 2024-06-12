import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
} from "react-native";
import { COLORS } from "../../AppStyles";

const AddItemModal = ({
  visible,
  onClose,
  newItemName,
  setNewItemName,
  addItemToCategory,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="New item name"
        />
        <TouchableOpacity
          onPress={addItemToCategory}
          style={[styles.modalButton, styles.addButton]}
        >
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.modalButton, styles.cancelButton]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
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
});

export default AddItemModal;
