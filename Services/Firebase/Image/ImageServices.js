import { COLORS } from "../../../AppStyles";
import { languageMapping } from "./consts";
export const createFavoriteImageObj = (idx, favoriteImage) => {
  return {
    id: idx,
    image: favoriteImage.image,
    name_ar: favoriteImage.name_ar,
    name_en: favoriteImage.name_en,
    name_he: favoriteImage.name_he,
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
  return image[languageMapping[language]];
};
