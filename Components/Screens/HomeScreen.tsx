import React from "react";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SCREENS, ICONS_NAMES } from "../../constants";
import { COLORS, iconSize } from "../../AppStyles";
import DragAndDropContainer from "./DragAndDropContainer";

const delayTime = 2000;

const HomeScreen = ({ navigation }) => {
  // const navigateToSettingPageHandler = () => {
  //   setTimeout(() => {
  //     navigation.navigate(SCREENS.SETTINGS);
  //   }, delayTime);
  // };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Icon
          // style={styles.buttonsContainer}
          name={ICONS_NAMES.libraryIcon}
          size={iconSize}
          onPress={() => navigation.navigate(SCREENS.MENU)}

          // onLongPress={navigateToSettingPageHandler}
        />
        <Icon
          name={ICONS_NAMES.settings}
          size={iconSize}
          onPress={() => navigation.navigate(SCREENS.SETTINGS)}
          // onLongPress={navigateToSettingPageHandler}
        />
      </View>
      <DragAndDropContainer />
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
  },
});

export default HomeScreen;
