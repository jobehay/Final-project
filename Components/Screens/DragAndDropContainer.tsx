import * as React from "react";
import { StyleSheet, Text, View, Dimensions, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DraxProvider, DraxView, DraxList } from "react-native-drax";
import { COLORS, iconSize } from "../../AppStyles";
import Icon from "react-native-vector-icons/FontAwesome";

import { ICONS_NAMES } from "../../constants";

const gestureRootViewStyle = { flex: 1 };

export const dragImages = [
  {
    id: 1,
    name: "I",

    image: require("../../assets/dragdrop/person.png"),
    background_color: COLORS.white,
  },
  {
    id: 3,
    name: "I want to eat",
    image: require("../../assets/dragdrop/iwonttoeat.png"),
    background_color: COLORS.white,
  },
  {
    id: 2,
    name: "Apple",
    image: require("../../assets/dragdrop/apple.png"),
    background_color: COLORS.white,
  },
  {
    id: 4,
    name: "i want ",
    image: require("../../assets/dragdrop/iwont.png"),
    background_color: COLORS.white,
  },
  {
    id: 5,
    name: "mom",
    image: require("../../assets/dragdrop/mom.png"),
    background_color: COLORS.white,
  },
  {
    id: 6,
    name: "I want to go",
    image: require("../../assets/dragdrop/iwonttogo.png"),
    background_color: COLORS.white,
  },
  {
    id: 7,
    name: "house",
    image: require("../../assets/dragdrop/house.png"),
    background_color: COLORS.white,
  },
];

const defaultFirstReceivingItemList = [
  { id: 1, name: "", image: "", background_color: COLORS.grey },
  { id: 2, name: "", image: "", background_color: COLORS.grey },
  { id: 3, name: "", image: "", background_color: COLORS.grey },
  { id: 4, name: "", image: "", background_color: COLORS.grey },
];

const DragAndDropContainer = () => {
  const [receivingItemList, setReceivedItemList] = React.useState(
    defaultFirstReceivingItemList
  );

  const [dragItemMiddleList, setDragItemListMiddle] =
    React.useState(dragImages);
  const [originalPositions, setOriginalPositions] = React.useState([]);

  const [itemDroppedInside, setItemDroppedInside] = React.useState(false);

  const DragUIComponent = ({ item, index }) => {
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
        <Image source={item.image} style={styles.image} />
        <Text style={styles.subText}>{item.name}</Text>
      </DraxView>
    );
  };

  const ReceivingZoneUIComponent = ({ item, index }) => {
    const isEmptySlot = !item.name && !item.image;

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
              <Image source={item.image} style={styles.image} />
              <Text style={styles.subText}>{item.name}</Text>
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

          if (
            !newReceivingItemList[index].name &&
            !newReceivingItemList[index].image
          ) {
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

  const onClickResetHandler = () => {
    // Resetting the state variables directly
    setReceivedItemList([...defaultFirstReceivingItemList]);
    setDragItemListMiddle([...dragImages]);
    setOriginalPositions([]);
  };

  const onClickSpeechHandler = () => {};

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

    // borderRadius: 10, // Adjust border radius as needed
    marginBottom: 5, // Adjust margin as needed
    // borderWidth: 2,
    // borderColor: COLORS.grey, // Border color with transparency
  },
});
