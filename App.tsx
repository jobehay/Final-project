import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./Components/Screens/HomeScreen";
import SettingsScreen from "./Components/Screens/SettingsScreen";
import CategoryScreen from "./Components/Screens/CategoryScreen";

import { SCREENS } from "./constants";
import { useTranslation } from "react-i18next";
import { FONT_SIZE } from "./AppStyles";
import React, { useEffect, useState } from "react";
import { testFirestoreConnection } from "./configs/firebase";
import { getCurrentUserOrCreateUser } from "./Services/Firebase/User/UserServices";
import {
  createDocument,
  findDocument,
  readDocuments,
} from "./Services/Firebase/firebaseAPI";
import { MyCollections } from "./Services/Firebase/collectionNames";
import { defaultUser } from "./Services/Firebase/User/UserModel";
const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    testFirestoreConnection();

    const fetchData = async () => {
      if (!userDetails) {
        return;
      }
      const currentUser = await getCurrentUserOrCreateUser();

      setUserDetails(currentUser);
    };

    const createCommonData = async () => {
      const categoriesCommon = await readDocuments(
        MyCollections.CATEGORIES_COMMON
      );
      const itemsCommon = await readDocuments(MyCollections.ITEMS_COMMON);
      categoriesCommon.forEach(async (categoryCommon: any) => {
        let newCategoryCommonId = await findDocument(
          MyCollections.CATEGORIES,
          "name",
          categoryCommon.name
        );

        if (!newCategoryCommonId) {
          newCategoryCommonId = await createDocument(MyCollections.CATEGORIES, {
            name: categoryCommon.name,
            deviceID: defaultUser?.deviceID,
            isCommon: true,
          });
        }

        const itemsCommonFilterByCategoryName = itemsCommon.filter(
          (item: any) => item.categoryId === categoryCommon.id
        );

        itemsCommonFilterByCategoryName.forEach(async (itemCommon: any) => {
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

    fetchData();
    createCommonData();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={SCREENS.HOME}>
        <Stack.Screen
          name={SCREENS.HOME}
          component={HomeScreen}
          options={() => ({
            title: null,
          })}
        />
        <Stack.Screen
          name={SCREENS.SETTINGS}
          component={SettingsScreen}
          options={() => ({
            headerBackTitleVisible: true,
            headerBackTitle: t(`general.back`),
            title: t(`screen.settings.title`),
            headerTitleStyle: {
              fontSize: FONT_SIZE.headerTitle,
            },
          })}
        />
        <Stack.Screen
          name={SCREENS.MENU}
          component={CategoryScreen}
          options={() => ({
            headerBackTitleVisible: true,
            headerBackTitle: t(`general.back`),
            headerTitleStyle: {
              fontSize: FONT_SIZE.headerTitle,
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
