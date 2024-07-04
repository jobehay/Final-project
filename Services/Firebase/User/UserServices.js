import { USER, defaultUser } from "../User/UserModel";
import * as Device from "expo-device";
import { MyCollections } from "../collectionNames";
import { findDocument, createDocument, readDocuments } from "../firebaseAPI";
import i18n from "i18next";

export const getCurrentUser = async () => {
  try {
    const currentUser = await findDocument(
      MyCollections.USERS,
      USER.DEVICE_ID,
      Device.osInternalBuildId
    );

    return currentUser;
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
    return null;
  }
};

const createCommonData = async () => {
  const categoriesCommon = await readDocuments(MyCollections.CATEGORIES_COMMON);

  const itemsCommon = await readDocuments(MyCollections.ITEMS_COMMON);
  categoriesCommon.forEach(async (categoryCommon) => {
    let newCategoryCommonId = await findDocument(
      MyCollections.CATEGORIES,
      "deviceID",
      defaultUser?.deviceID
    );

    if (!newCategoryCommonId) {
      newCategoryCommonId = await createDocument(MyCollections.CATEGORIES, {
        name: categoryCommon.name,
        deviceID: defaultUser?.deviceID,
        isCommon: true,
      });
    }

    const itemsCommonFilterByCategoryID = itemsCommon.filter(
      (item) => item.categoryId === categoryCommon.id
    );

    itemsCommonFilterByCategoryID.forEach(async (itemCommon) => {
      if (typeof newCategoryCommonId === "object") {
        newCategoryCommonId = newCategoryCommonId.id;
      }

      const item = await findDocument(
        MyCollections.ITEMS,
        "deviceIdAndCategoryId",
        `${defaultUser?.deviceID}${newCategoryCommonId}`
      );

      if (!item)
        await createDocument(MyCollections.ITEMS, {
          name: itemCommon.name || "",
          categoryId: newCategoryCommonId,
          image: itemCommon.image || "",
          isStar: itemCommon.isStar || false,
          deviceID: defaultUser?.deviceID,
          isCommon: true,
          deviceIdAndCategoryId: `${defaultUser?.deviceID}${newCategoryCommonId}`,
        });
    });
  });
};

export const getCurrentUserOrCreateUser = async () => {
  try {
    let currentUser = await getCurrentUser();
    console.log("Current user :", currentUser);
    i18n.changeLanguage(currentUser?.selectedLang);
    if (!currentUser) {
      const newUser = await createDocument(MyCollections.USERS, defaultUser);
      await createCommonData();

      return newUser;
    }

    return currentUser;
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
    return null;
  }
};
