import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../../AppStyles";
import {
  createDocument,
  deleteDocument,
  readDocumentsRealTime,
  updateDocument,
  readDocuments,
  deleteImage,
} from "../../Services/Firebase/firebaseAPI";
import { MyCollections } from "../../Services/Firebase/collectionNames";
import AddItemModal from "./AddItemModal";
import { useNavigation } from "@react-navigation/native";
import { getCurrentUserOrCreateUser } from "../../Services/Firebase/User/UserServices";
import { getNameByLang } from "../../Services/Firebase/Image/ImageServices";
import { useTranslation } from "react-i18next";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemModalVisible, setNewItemModalVisible] = useState(false);
  const [newItemCategoryId, setNewItemCategoryId] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingCategoryNames, setEditingCategoryNames] = useState({});
  const [loading, setLoading] = useState(true);

  const {
    t,
    i18n: { language },
  } = useTranslation();

  const navigation = useNavigation();

  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUserOrCreateUser();
      setUserDetails(currentUser);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!userDetails) return;

    setLoading(true);

    const unsubscribeCategories = readDocumentsRealTime(
      MyCollections.CATEGORIES,
      async (categoriesFromFirebase) => {
        const items = await readDocuments(MyCollections.ITEMS);

        const relevantCategories = categoriesFromFirebase.filter(
          (category) => category?.deviceID === userDetails?.deviceID
        );

        const sortedCategories = relevantCategories
          .map((category) => ({
            id: category.id,
            name: category.name,
            isCommon: category.isCommon,
            timestamp: category.timestamp,
            images: items
              .filter(
                (item) =>
                  item.categoryId === category.id &&
                  item.deviceID === userDetails?.deviceID
              )
              .map((item) => ({
                ...item,
                name: getNameByLang(item, language),
                src: { uri: item.image },
              })),
            editing: false,
          }))
          .sort((a, b) => {
            if (a.isCommon && !b.isCommon) return -1;
            if (!a.isCommon && b.isCommon) return 1;
            return new Date(a.timestamp) - new Date(b.timestamp);
          });

        const starredItems = items
          .filter(
            (item) => item.isStar && item.deviceID === userDetails?.deviceID
          )
          .map((item) => ({
            ...item,
            name: getNameByLang(item, language),
            src: { uri: item.image },
          }))
          .sort(
            (a, b) => new Date(a.position_date) - new Date(b.position_date)
          );

        const starredCategory = {
          id: "starred",
          name: t("starredItems"),
          isCommon: false,
          timestamp: new Date().toISOString(),
          images: starredItems,
          editing: false,
        };

        setCategories([starredCategory, ...sortedCategories]);
        setLoading(false);
      }
    );

    const unsubscribeItems = readDocumentsRealTime(
      MyCollections.ITEMS,
      (itemsFromFirebase) => {
        const starredItems = itemsFromFirebase
          .filter(
            (item) => item.isStar && item.deviceID === userDetails?.deviceID
          )
          .map((item) => ({
            ...item,
            name: getNameByLang(item, language),
            src: { uri: item.image },
          }))
          .sort(
            (a, b) => new Date(a.position_date) - new Date(b.position_date)
          );

        setCategories((prevCategories) => {
          const updatedCategories = prevCategories.map((category) => {
            if (category.id === "starred") {
              return { ...category, images: starredItems };
            }
            return {
              ...category,
              images: itemsFromFirebase
                .filter((item) => item.categoryId === category.id)
                .map((item) => ({
                  ...item,
                  name: getNameByLang(item, language),
                  src: { uri: item.image },
                })),
            };
          });

          return [
            updatedCategories.find((cat) => cat.id === "starred"),
            ...updatedCategories.filter((cat) => cat.id !== "starred"),
          ];
        });
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, [userDetails]);

  const addCategory = async () => {
    if (newCategoryName.trim() === "") return;

    const newCategoryId = await createDocument(MyCollections.CATEGORIES, {
      name: newCategoryName,
      deviceID: userDetails?.deviceID,
      timestamp: new Date().toISOString(),
    });

    if (newCategoryId) {
      const newCategory = {
        id: newCategoryId,
        name: newCategoryName,
        images: [],
        editing: false,
        timestamp: new Date().toISOString(),
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setNewCategoryName("");
    }
  };

  const deleteCategory = (id) => {
    Alert.alert(t("confirmDeletion"), t("deleteCategory"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteDocument(MyCollections.CATEGORIES, id);
          setCategories(categories.filter((category) => category.id !== id));
        },
      },
    ]);
  };

  const toggleCategoryEditing = (id) => {
    setCategories(
      categories.map((category) =>
        category.id === id
          ? { ...category, editing: !category.editing }
          : category
      )
    );
  };

  const handleCategoryNameChange = (id, newName) => {
    setEditingCategoryNames({ ...editingCategoryNames, [id]: newName });

    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);

    this.debounceTimeout = setTimeout(async () => {
      await updateDocument(MyCollections.CATEGORIES, id, { name: newName });
      setCategories(
        categories.map((category) =>
          category.id === id
            ? { ...category, name: newName, editing: false }
            : category
        )
      );
    }, 500);
  };

  const openNewItemModal = (categoryId) => {
    setNewItemCategoryId(categoryId);
    setNewItemName("");
    setNewItemModalVisible(true);
  };

  const addItemToCategory = async (item) => {
    const { image, name, position_date } = item;
    const newItem = {
      name: name,
      image: image,
      categoryId: newItemCategoryId,
      isStar: false,
      deviceID: userDetails?.deviceID,
      position: position_date || "",
    };
    const newItemId = await createDocument(MyCollections.ITEMS, newItem);
    setCategories(
      categories.map((category) =>
        category.id === newItemCategoryId
          ? {
              ...category,
              images: [
                ...category.images,
                {
                  ...newItem,
                  id: newItemId,
                  src: { uri: newItem.image },
                },
              ],
            }
          : category
      )
    );
    setNewItemModalVisible(false);
  };

  const deleteItem = async (categoryId, index, item) => {
    Alert.alert(t("confirmDeletion"), t("deleteItem"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteDocument(MyCollections.ITEMS, item.id);
          await deleteImage(item.src.uri);
          setCategories(
            categories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    images: category.images.filter((_, i) => i !== index),
                  }
                : category
            )
          );

          if (item.isStar) {
            setCategories((prevCategories) => {
              return prevCategories.map((category) => {
                if (category.id === "starred") {
                  return {
                    ...category,
                    images: category.images.filter((img) => img.id !== item.id),
                  };
                }
                return category;
              });
            });
          }
        },
      },
    ]);
  };

  const toggleStar = async (categoryId, index, item) => {
    const updatedItem = { ...item, isStar: !item.isStar };
    const currentDate = new Date();
    await updateDocument(MyCollections.ITEMS, item.id, {
      isStar: updatedItem.isStar,
      position_date: currentDate,
    });

    setCategories((prevCategories) => {
      const newCategories = prevCategories.map((category) => {
        if (category.id === "starred") {
          if (updatedItem.isStar) {
            if (!category.images.find((img) => img.id === updatedItem.id)) {
              return {
                ...category,
                images: [...category.images, updatedItem],
              };
            }
          } else {
            return {
              ...category,
              images: category.images.filter(
                (img) => img.id !== updatedItem.id
              ),
            };
          }
        }
        return category;
      });
      return newCategories;
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      <FlatList
        data={categories}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <TextInput
              style={styles.newCategoryInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder={t("newCategoryName")}
            />
            <TouchableOpacity
              onPress={addCategory}
              style={styles.addCategoryButton}
            >
              <Text style={styles.buttonText}>{t("addCategory")}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) =>
          item ? (
            <View
              style={[
                styles.categoryContainer,
                item.id === "starred" && styles.starredCategoryContainer,
              ]}
            >
              <View style={styles.categoryTitleContainer}>
                {item.editing ? (
                  <TextInput
                    style={styles.categoryTitleInput}
                    value={editingCategoryNames[item.id] || item.name}
                    onChangeText={(newName) =>
                      handleCategoryNameChange(item.id, newName)
                    }
                  />
                ) : (
                  <Text
                    style={[
                      styles.categoryTitle,
                      item.id === "starred" && styles.starredCategoryTitle,
                    ]}
                  >
                    {item.name} <Icon name="star" size={20} color="gold" />
                  </Text>
                )}
                {!item.isCommon && item.id !== "starred" && (
                  <>
                    <TouchableOpacity
                      onPress={() => toggleCategoryEditing(item.id)}
                      style={styles.categoryIconButton}
                    >
                      <Icon name={item.editing ? "save" : "edit"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteCategory(item.id)}
                      style={styles.categoryIconButton}
                    >
                      <Icon name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </>
                )}
                {!item.isCommon && item.id !== "starred" && (
                  <TouchableOpacity
                    onPress={() => openNewItemModal(item.id)}
                    style={styles.categoryIconButton}
                  >
                    <Icon name="plus" size={20} />
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                horizontal
                data={item.images}
                keyExtractor={(img) => img.id}
                renderItem={({ item: img, index }) => (
                  <TouchableOpacity>
                    <View style={styles.imageContainer}>
                      <Image source={img.src} style={styles.image} />
                      <Text style={styles.imageText}>{img.name}</Text>
                      <View style={styles.iconContainer}>
                        {!img.isCommon && (
                          <TouchableOpacity
                            onPress={() => deleteItem(item.id, index, img)}
                          >
                            <Icon
                              name="trash"
                              size={16}
                              color="red"
                              style={styles.deleteButton}
                            />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => toggleStar(img.categoryId, index, img)}
                        >
                          <Icon
                            name={img.isStar ? "star" : "star-o"}
                            size={16}
                            color="gold"
                            style={styles.starButton}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : null
        }
      />
      <AddItemModal
        visible={newItemModalVisible}
        onClose={() => setNewItemModalVisible(false)}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        addItemToCategory={addItemToCategory}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  starredCategoryContainer: {
    backgroundColor: COLORS.secondary, // שינוי צבע הרקע לקטגוריה "פריטים עם כוכב"
    padding: 10,
    borderRadius: 10,
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  starredCategoryTitle: {
    color: COLORS.primary,
  },
  categoryTitleInput: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    borderBottomWidth: 1,
  },
  categoryIconButton: {
    marginHorizontal: 5,
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 80,
    height: 80,
  },
  imageText: {
    textAlign: "center",
    marginTop: 5,
    width: 80,
    overflow: "hidden",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  deleteButton: {
    marginHorizontal: 5,
  },
  starButton: {
    marginHorizontal: 5,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  newCategoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  addCategoryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CategoryManager;
