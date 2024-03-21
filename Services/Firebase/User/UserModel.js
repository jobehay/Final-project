import * as Device from "expo-device";

export const USER = {
  DEVICE_ID: "deviceID",
  ACCESSIBLE: "accessible",
  SELECTED_LANG: "selectedLang",
};

export const defaultUser = {
  [USER.DEVICE_ID]: Device.osInternalBuildId,
  [USER.ACCESSIBLE]: "Medium",
  [USER.SELECTED_LANG]: "en",
};
