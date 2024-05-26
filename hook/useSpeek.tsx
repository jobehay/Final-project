import { useTranslation } from "react-i18next";
import * as Speech from "expo-speech";

const useSpeak = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const speak = (text) => {
    const options = {
      language: language,
    };
    Speech.speak(text, options);
  };

  return speak;
};

export default useSpeak;
