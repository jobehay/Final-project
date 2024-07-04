import { COLORS } from "../../../AppStyles";
import { languageMapping } from "./consts";
import * as ImagePicker from "expo-image-picker";

export const createFavoriteImageObj = (idx, favoriteImage) => {
  return {
    id: idx,
    image: favoriteImage.image,
    position_date: favoriteImage.position_date,
    name_ar: favoriteImage.name_ar,
    name_en: favoriteImage.name_en,
    name_he: favoriteImage.name_he,
    name: favoriteImage.name,
    background_color: COLORS.white,
  };
};
export const createDefaultCard = (idx) => {
  return {
    id: idx,
    image: "",
    name_ar: "",
    name_en: "",
    name_he: "",
    name: "",
    background_color: COLORS.grey,
  };
};

export const createDefaultFirstReceivingItemList = (numberCards) => {
  let items = [];
  for (let i = 0; i < numberCards; i++) {
    items.push(createDefaultCard(i));
  }
  return items;
};

export const getNameByLang = (image, language) => {
  return image[languageMapping[language]] || image.name;
};

export const pickImageAndUpload = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access camera roll is required!");
    return;
  }

  let pickerResult = await ImagePicker.launchImageLibraryAsync();

  if (pickerResult?.cancelled) {
    console.log("User cancelled image picker");
    return null;
  }

  const uri = pickerResult.assets[0].uri;

  return uri;
};
