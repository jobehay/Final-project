import React, { useState } from "react";
import { View, StyleSheet, Text, ViewStyle } from "react-native";
import Button from "../Atom/Button/Button";
import { initReactI18next } from "react-i18next";
import { useTranslation } from "react-i18next";
import { containerRTLStyles } from "../../AppStyles";
import { FONT_SIZE } from "../../AppStyles";
import i18n from "i18next";
import "intl-pluralrules";

import en from "../../assets/locales/en.json";
import ar from "../../assets/locales/ar.json";
import he from "../../assets/locales/he.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    he: { translation: he },
  },
  lng: "en", // defaut language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

const ChangeLanguage = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setSelectedLanguage(lng);
  };

  return (
    <View
      style={[styles.container, i18n.dir() === "rtl" && containerRTLStyles as ViewStyle]}
    >
      <Text style={styles.label}> {t("screen.settings.languages")}</Text>
      <View style={styles.buttonsContainer}>
        <Button
          isSelected={selectedLanguage === "en"}
          title="English"
          onPress={() => changeLanguage("en")}
          disabled={selectedLanguage === "en"}
        />
        <Button
          isSelected={selectedLanguage === "ar"}
          title="العربية"
          onPress={() => changeLanguage("ar")}
          disabled={selectedLanguage === "ar"}
        />
        <Button
          isSelected={selectedLanguage === "he"}
          title="עברית"
          onPress={() => changeLanguage("he")}
          disabled={selectedLanguage === "he"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: "0%",
  },
  label: {
    margin: "5%",
    fontSize: FONT_SIZE.title,
    fontWeight: "bold",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default ChangeLanguage;
