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
const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState();
  useEffect(() => {
    testFirestoreConnection();

    const fetchData = async () => {
      const currentUser = await getCurrentUserOrCreateUser();

      setUserDetails(currentUser);
    };

    fetchData();
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
