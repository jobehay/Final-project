import { View, StyleSheet } from "react-native";
import ChangeLanguage from "../ChangeLanguage/ChangeLanguage";
import { COLORS } from "../../AppStyles";

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <ChangeLanguage />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    height: "100%",
  },
});

export default SettingsScreen;
