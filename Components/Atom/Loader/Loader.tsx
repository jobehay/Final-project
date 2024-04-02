import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../../../AppStyles";

const Loader = ({ isLoading, children }) => {
  if (!isLoading) return children; // Render children if isLoading is false

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: 10,
    padding: 20,
  },
});

export default Loader;
