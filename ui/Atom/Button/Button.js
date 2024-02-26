import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { COLORS, FONT_SIZE } from "../../../AppStyles";

const Button = (props) => {
  const { onPress, title, disabled, isSelected } = props;
  return (
    <Pressable
      style={isSelected ? styles.buttonSelected : styles.button}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={isSelected ? styles.textSelected : styles.text}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
    backgroundColor: COLORS.secondary,
  },
  buttonSelected: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: FONT_SIZE.subTitle,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: COLORS.textPrimary,
  },
  textSelected: {
    fontSize: FONT_SIZE.subTitle,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: COLORS.white,
  },
});

export default Button;
