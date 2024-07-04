import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SCREENS, ICONS_NAMES } from "../../constants";
import { COLORS, iconSize } from "../../AppStyles";
import DragAndDropContainer from "./DragAndDropContainer";
import { useTranslation } from "react-i18next";

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [passcode, setPasscode] = useState("");
  const correctPasscode = "55555"; // The correct passcode is five asterisks

  const handleSettingsPress = () => {
    setModalVisible(true);
  };

  const handlePasscodeSubmit = () => {
    if (passcode === correctPasscode) {
      setPasscode("");
      setModalVisible(false);
      navigation.navigate(SCREENS.SETTINGS);
    } else {
      alert("Incorrect passcode");
    }
  };

  const handleCloseModal = () => {
    setPasscode("");
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)}>
          <Icon
            name={ICONS_NAMES.libraryIcon}
            size={iconSize}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSettingsPress}>
          <Icon
            name={ICONS_NAMES.settings}
            size={iconSize}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <DragAndDropContainer />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("password")}</Text>
            <TextInput
              style={styles.input}
              value={passcode}
              onChangeText={setPasscode}
              keyboardType="numeric"
              secureTextEntry
              placeholder={t("enterPassword")}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handlePasscodeSubmit}
            >
              <Text style={styles.buttonText}>{t("submit")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCloseModal}
            >
              <Text style={styles.buttonText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    backgroundColor: COLORS.secondary,
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "gray",
  },
});

export default HomeScreen;
