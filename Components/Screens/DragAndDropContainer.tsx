import * as React from "react";
import { StyleSheet, Text, View, Dimensions, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DraxProvider, DraxView, DraxList } from "react-native-drax";
import { COLORS, iconSize } from "../../AppStyles";
import Icon from "react-native-vector-icons/FontAwesome";

import { ICONS_NAMES } from "../../constants";
import { useTranslation } from "react-i18next";
import useSpeak from "../../hook/useSpeek";
import { MyCollections } from "../../Services/Firebase/collectionNames";
import { readDocuments } from "../../Services/Firebase/firebaseAPI";
import {
  createDefaultFirstReceivingItemList,
  createFavoriteImageObj,
  getNameByLang,
} from "../../Services/Firebase/Image/ImageServices";
import { CARDS_NUMBERS } from "../../Services/Firebase/Image/consts";

const gestureRootViewStyle = { flex: 1 };

const DragAndDropContainer = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const speak = useSpeak();

  const [receivingItemList, setReceivedItemList] = React.useState(
    createDefaultFirstReceivingItemList(CARDS_NUMBERS)
  );

  const [dragItemMiddleList, setDragItemListMiddle] = React.useState<any>();
  const fetchFavoriteIamges = async () => {
    const favoriteImages = await readDocuments(MyCollections.FAVORITE_IMAGES);
    favoriteImages.map((image, idx) => createFavoriteImageObj(idx, image));
    setDragItemListMiddle(favoriteImages);
  };

  React.useEffect(() => {
    fetchFavoriteIamges();
  }, []);

  const [originalPositions, setOriginalPositions] = React.useState([]);

  const [itemDroppedInside, setItemDroppedInside] = React.useState(false);

  const DragUIComponent = ({ item, index }) => {
    const itemName = getNameByLang(item, language);
    return (
      <DraxView
        style={[
          styles.draggableBox,
          { backgroundColor: item.background_color },
        ]}
        draggingStyle={styles.dragging}
        dragReleasedStyle={styles.dragging}
        hoverDraggingStyle={styles.hoverDragging}
        dragPayload={index}
        longPressDelay={150}
        key={index}
        onDragStart={() => {
          // Store the original position of the dragged item
          setOriginalPositions([...dragItemMiddleList]);
        }}
        onDragEnd={(event) => {
          if (!itemDroppedInside) {
            // Revert the movement if item was not dropped inside drop zone
            setDragItemListMiddle(originalPositions);
          }
          setItemDroppedInside(false); // Reset the flag
        }}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.subText}>{itemName}</Text>
      </DraxView>
    );
  };

  const ReceivingZoneUIComponent = ({ item, index }) => {
    const itemName = getNameByLang(item, language);

    const isEmptySlot = !itemName && !item.image;

    return (
      <DraxView
        style={[
          // styles.centeredContent,
          styles.receivingZone,
          { backgroundColor: item.background_color },
        ]}
        receivingStyle={styles.receiving}
        renderContent={({ viewState }) => {
          const receivingDrag = viewState && viewState.receivingDrag;
          const payload = receivingDrag && receivingDrag.payload;
          return (
            <View>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.subText}>{itemName}</Text>
            </View>
          );
        }}
        key={index}
        onReceiveDragDrop={(event) => {
          const draggedIndex = event.dragged.payload;
          const newReceivingItemList = [...receivingItemList];
          const newDragItemMiddleList = dragItemMiddleList.filter(
            (_, index) => index !== draggedIndex
          );
          const name = getNameByLang(newReceivingItemList[index], language);
          if (!name && !newReceivingItemList[index].image) {
            // If the slot is empty, allow dropping the dragged item
            newReceivingItemList[index] = dragItemMiddleList[draggedIndex];
            setReceivedItemList(newReceivingItemList);
            setDragItemListMiddle(newDragItemMiddleList);
          } else {
            // Revert the movement if item was not dropped inside drop zone
            setDragItemListMiddle(originalPositions);
          }
        }}
      />
    );
  };

  const FlatListItemSeparator = () => {
    return <View style={styles.itemSeparator} />;
  };

  const onClickResetHandler = async () => {
    // Resetting the state variables directly
    await fetchFavoriteIamges();
    setReceivedItemList([
      ...createDefaultFirstReceivingItemList(CARDS_NUMBERS),
    ]);
    setOriginalPositions([]);
  };

  const buildSentance = () => {
    let words: string[] = [];
    receivingItemList.map((itemSelected) => {
      const name = getNameByLang(itemSelected, language);
      words.push(name);
    });
    return words.join(" ");
  };
  const onClickSpeechHandler = () => {
    const sentatnce = buildSentance();
    speak(sentatnce);
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
          <View style={styles.buttonsContainer}>
            <Icon
              style={styles.icon}
              name={ICONS_NAMES.reset}
              size={iconSize}
              onPress={onClickResetHandler}
            />
            <Icon
              style={styles.icon}
              name={ICONS_NAMES.microphone}
              size={iconSize}
              onPress={onClickSpeechHandler}
            />
          </View>

          <View style={styles.receivingContainer}>
            {receivingItemList.map((item, index) => (
              <ReceivingZoneUIComponent key={index} item={item} index={index} />
            ))}
          </View>
        </View>
      </DraxProvider>
    </GestureHandlerRootView>
  );
};

export default DragAndDropContainer;

const styles = StyleSheet.create({
  borderbook: {
    borderBlockColor: "black",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  container: {
    flex: 1,
  },
  icon: {
    marginTop: 5,
  },

  receivingZone: {
    height: Dimensions.get("window").width / 4 - 12,
    borderRadius: 10,
    width: Dimensions.get("window").width / 4 - 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  receiving: {
    borderWidth: 2,
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
  },
  dragging: {
    opacity: 1,
  },
  hoverDragging: {
    borderWidth: 2,
    borderColor: COLORS.grey,
    alignItems: "center",
  },
  receivingContainer: {
    padding: 15,
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    height: "50%",
  },
  itemSeparator: {
    height: 15,
  },
  draxListContainer: {
    height: "70%",
    backgroundColor: COLORS.primary,
    borderBlockColor: "red",
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
    // borderRadius: 10, // Adjust border radius as needed
    marginBottom: 5, // Adjust margin as needed
    // borderWidth: 2,
    // borderColor: COLORS.grey, // Border color with transparency
  },
});
