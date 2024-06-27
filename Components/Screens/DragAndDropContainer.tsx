import * as React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  LayoutAnimation,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DraxProvider, DraxView, DraxList } from "react-native-drax";
import { COLORS, iconSize } from "../../AppStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import { ICONS_NAMES } from "../../constants";
import { useTranslation } from "react-i18next";
import useSpeak from "../../hook/useSpeek";
import { MyCollections } from "../../Services/Firebase/collectionNames";
import {
  readDocumentsRealTime,
  readDocuments,
} from "../../Services/Firebase/firebaseAPI";
import {
  createDefaultFirstReceivingItemList,
  createFavoriteImageObj,
  getNameByLang,
} from "../../Services/Firebase/Image/ImageServices";
import { CARDS_NUMBERS } from "../../Services/Firebase/Image/consts";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getCurrentUserOrCreateUser } from "../../Services/Firebase/User/UserServices";

const gestureRootViewStyle = { flex: 1 };

const DragAndDropContainer = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const speak = useSpeak();
  const navigation = useNavigation();
  const route = useRoute();

  const [receivingItemList, setReceivedItemList] = React.useState(
    createDefaultFirstReceivingItemList(CARDS_NUMBERS)
  );
  const [dragItemMiddleList, setDragItemListMiddle] = React.useState([]);
  const [originalPositions, setOriginalPositions] = React.useState([]);
  const [itemDroppedInside, setItemDroppedInside] = React.useState(false);

  const [userDetails, setUserDetails] = React.useState(null);
  React.useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUserOrCreateUser();

      setUserDetails(currentUser);
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    const unsubscribe = readDocumentsRealTime(MyCollections.ITEMS, (items) => {
      const starItems = items.filter(
        (item) => item.isStar && item.deviceID === userDetails?.deviceID
      );
      const favoriteImages = starItems
        .map((item, idx) => createFavoriteImageObj(idx, item))
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp
      setDragItemListMiddle([...favoriteImages.reverse(), null]); // Newest items on the right, add null at the end for the new item
    });

    return () => unsubscribe();
  }, [userDetails]);

  React.useEffect(() => {
    if (route.params?.newImage) {
      const newImage = route.params.newImage;
      setDragItemListMiddle((prev) => [...prev, newImage]);
    }
  }, [route.params?.newImage]);

  const DragUIComponent = ({ item, index }) => {
    if (!item) return <View style={styles.emptySlot} />;

    const itemName = getNameByLang(item, language);
    return (
      <DraxView
        style={[styles.draggableBox, styles.itemBackground]}
        draggingStyle={styles.dragging}
        dragReleasedStyle={styles.dragging}
        hoverDraggingStyle={styles.hoverDragging}
        dragPayload={{ from: "middle", index }}
        longPressDelay={150}
        key={index}
        onDragStart={() => {
          setOriginalPositions([...dragItemMiddleList]);
        }}
        onDragEnd={() => {
          if (!itemDroppedInside) {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setDragItemListMiddle(originalPositions);
          }
          setItemDroppedInside(false);
        }}
      >
        {item?.image && (
          <Image source={{ uri: item?.image }} style={styles.image} />
        )}
        <Text style={styles.subText}>{itemName}</Text>
      </DraxView>
    );
  };

  const ReceivingZoneUIComponent = ({ item, index }) => {
    const itemName = getNameByLang(item, language);
    const isEmptySlot = !itemName && !item.image;

    return (
      <DraxView
        style={[styles.receivingZone, styles.itemBackground]}
        receivingStyle={styles.receiving}
        dragPayload={{ from: "receiving", index }}
        renderContent={({ viewState }) => {
          const receivingDrag = viewState && viewState.receivingDrag;
          const payload = receivingDrag && receivingDrag.payload;
          return (
            <View>
              {item?.image && (
                <Image source={{ uri: item?.image }} style={styles.image} />
              )}
              <Text style={styles.subText}>{itemName}</Text>
            </View>
          );
        }}
        key={index}
        onReceiveDragDrop={(event) => {
          const draggedIndex = event.dragged.payload.index;
          const from = event.dragged.payload.from;

          const newReceivingItemList = [...receivingItemList];
          const newDragItemMiddleList = [...dragItemMiddleList];

          if (from === "middle") {
            if (newReceivingItemList.filter((item) => item.image).length >= 4) {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setDragItemListMiddle(originalPositions);
              return;
            }
            newDragItemMiddleList[draggedIndex] = null;
            if (isEmptySlot) {
              newReceivingItemList[index] = dragItemMiddleList[draggedIndex];
            } else {
              let targetIndex = index;
              while (
                targetIndex < newReceivingItemList.length - 1 &&
                newReceivingItemList[targetIndex + 1]
              ) {
                targetIndex++;
              }
              for (let i = targetIndex; i > index; i--) {
                newReceivingItemList[i] = newReceivingItemList[i - 1];
              }
              newReceivingItemList[index] = dragItemMiddleList[draggedIndex];
            }
          } else if (from === "receiving") {
            const temp = newReceivingItemList[index];
            newReceivingItemList[index] = newReceivingItemList[draggedIndex];
            newReceivingItemList[draggedIndex] = temp;
          }

          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setReceivedItemList(newReceivingItemList);
          setDragItemListMiddle(newDragItemMiddleList);
          setItemDroppedInside(true);
        }}
      />
    );
  };

  const FlatListItemSeparator = () => {
    return <View style={styles.itemSeparator} />;
  };

  const onClickResetHandler = async () => {
    const items = await readDocuments(MyCollections.ITEMS);
    const starItems = items.filter(
      (item: any) => item.isStar && item.deviceID === userDetails?.deviceID
    );
    const favoriteImages = starItems
      .map((item, idx) => createFavoriteImageObj(idx, item))
      .sort((a, b) => a.timestamp - b.timestamp);
    setDragItemListMiddle([...favoriteImages.reverse(), null]);
    setReceivedItemList(createDefaultFirstReceivingItemList(CARDS_NUMBERS));
    setOriginalPositions([]);
  };

  const buildSentence = () => {
    return receivingItemList
      .map((item) => getNameByLang(item, language))
      .join(" ");
  };

  const onClickSpeechHandler = () => {
    speak(buildSentence());
  };

  return (
    <GestureHandlerRootView style={gestureRootViewStyle}>
      <DraxProvider>
        <View style={styles.container}>
          <View style={styles.draxListContainer}>
            <DraxList
              data={dragItemMiddleList}
              renderItemContent={DragUIComponent}
              keyExtractor={(item, index) => index.toString()}
              numColumns={4}
              ItemSeparatorComponent={FlatListItemSeparator}
              scrollEnabled={true}
            />
          </View>
          <View style={styles.receivingContainer}>
            {receivingItemList.map((item, index) => (
              <ReceivingZoneUIComponent key={index} item={item} index={index} />
            ))}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={onClickResetHandler}
            >
              <Icon
                style={styles.icon}
                name={ICONS_NAMES.reset}
                size={iconSize}
              />
              <Text style={styles.buttonText}>{t("reset")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.speechButton]}
              onPress={onClickSpeechHandler}
            >
              <Icon
                style={styles.icon}
                name={ICONS_NAMES.microphone}
                size={iconSize}
              />
              <Text style={styles.buttonText}>{t("speak")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DraxProvider>
    </GestureHandlerRootView>
  );
};

export default DragAndDropContainer;

const styles = StyleSheet.create({
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  icon: {
    marginRight: 5,
  },
  receivingZone: {
    height: Dimensions.get("window").width / 4 - 12,
    borderRadius: 10,
    width: Dimensions.get("window").width / 4 - 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    backgroundColor: COLORS.grey,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  receiving: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  draggableBox: {
    margin: 10,
    marginTop: 20,
    borderRadius: 5,
    width: Dimensions.get("window").width / 4 - 12,
    height: Dimensions.get("window").width / 4 - 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginLeft: 6,
    backgroundColor: COLORS.grey,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  itemBackground: {
    backgroundColor: COLORS.white,
  },
  emptySlot: {
    margin: 10,
    marginTop: 20,
    borderRadius: 5,
    width: Dimensions.get("window").width / 4 - 12,
    height: Dimensions.get("window").width / 4 - 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginLeft: 6,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dragging: {
    opacity: 1,
  },
  hoverDragging: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
  },
  receivingContainer: {
    padding: 15,
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    height: "20%",
    justifyContent: "space-around",
  },
  itemSeparator: {
    height: 15,
  },
  draxListContainer: {
    height: "60%",
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
  },
  image: {
    width: 60,
    height: 60,
    alignItems: "center",
    resizeMode: "cover",
    marginBottom: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
  },
  resetButton: {
    backgroundColor: COLORS.red,
  },
  speechButton: {
    backgroundColor: COLORS.green,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
