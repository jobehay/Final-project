import React from "react";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SCREENS, ICONS_NAMES } from "../../constants";
import { COLORS, iconSize } from "../../AppStyles";

const delayTime = 2000;

const HomeScreen = ({ navigation }) => {
  // const navigateToSettingPageHandler = () => {
  //   setTimeout(() => {
  //     navigation.navigate(SCREENS.SETTINGS);
  //   }, delayTime);
  // };

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <Icon
          name={ICONS_NAMES.settings}
          size={iconSize}
          onPress={() => navigation.navigate(SCREENS.SETTINGS)}
          // onLongPress={navigateToSettingPageHandler}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    backgroundColor: COLORS.white,
  },
  headerActions: {
    marginRight: 10,
  },
});

export default HomeScreen;
