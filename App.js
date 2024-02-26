import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./UI/Screens/HomeScreen";
import SettingsScreen from "./UI/Screens/SettingsScreen";
import { SCREENS } from "./constants";
import { useTranslation } from "react-i18next";
import { FONT_SIZE } from "./AppStyles";
const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
