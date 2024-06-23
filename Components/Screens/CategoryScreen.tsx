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
import { SCREENS } from "../../constants";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemModalVisible, setNewItemModalVisible] = useState(false);
  const [newItemCategoryId, setNewItemCategoryId] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingCategoryNames, setEditingCategoryNames] = useState({});
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const protectedCategoryIds = [
    "Edspm4Kbx1huAiSCjG8L",
    "U8NVNaLzdVncknDG8D5B",
    "a8cfGdsLX3o6PVmy4M3d",
    "cnnblVZbdse2ZqUSdvqt",
  ];

  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUserOrCreateUser();

      setUserDetails(currentUser);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching data

    const unsubscribeCategories = readDocumentsRealTime(
      MyCollections.CATEGORIES,
      async (categoriesFromFirebase) => {
        const items = await readDocuments(MyCollections.ITEMS);

        const protectedCategories = categoriesFromFirebase.filter((category) =>
          protectedCategoryIds.includes(category.id)
        );

        const otherCategories = categoriesFromFirebase.filter(
          (category) =>
            !protectedCategoryIds.includes(category.id) &&
            category?.deviceID === userDetails?.deviceID
        );
        const sortedCategories = [
          ...protectedCategories,
          ...otherCategories,
        ].map((category) => ({
          id: category.id,
          name: category.name,
          images: items
            .filter((item: any) => item.categoryId === category.id)
            .map((item: any) => ({
              ...item,
              src: { uri: item.image }, // Ensure the image source is set correctly
            })),
          editing: false,
        }));

        setCategories(sortedCategories);
        setLoading(false); // Set loading to false after data is fetched
      }
    );

    const unsubscribeItems = readDocumentsRealTime(
      MyCollections.ITEMS,
      (itemsFromFirebase) => {
        setCategories((prevCategories) =>
          prevCategories.map((category) => ({
            ...category,
            images: itemsFromFirebase
              .filter((item) => item.categoryId === category.id)
              .map((item) => ({
                ...item,
                src: { uri: item.image },
              })),
          }))
        );
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, [userDetails]);

  // Function to add a new, empty category
  const addCategory = async () => {
    if (newCategoryName.trim() === "") return;

    // Create the new category in Firebase
    const newCategoryId = await createDocument(MyCollections.CATEGORIES, {
      name: newCategoryName,
      deviceID: userDetails?.deviceID,
    });

    if (newCategoryId) {
      // Update the local state
      const newCategory = {
        id: newCategoryId,
        name: newCategoryName,
        images: [], // Empty array for images
        editing: false,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
    }
  };

  // Function to delete a category by ID
  const deleteCategory = (id) => {
    if (protectedCategoryIds.includes(id)) return;

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this category?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDocument(MyCollections.CATEGORIES, id);
            setCategories(categories.filter((category) => category.id !== id));
          },
        },
      ]
    );
  };

  // Toggle editing mode for a category title
  const toggleCategoryEditing = (id) => {
    if (protectedCategoryIds.includes(id)) return;

    setCategories(
      categories.map((category) =>
        category.id === id
          ? { ...category, editing: !category.editing }
          : category
      )
    );
  };

  // Handle category name change with debouncing
  const handleCategoryNameChange = (id, newName) => {
    if (protectedCategoryIds.includes(id)) return;

    setEditingCategoryNames({ ...editingCategoryNames, [id]: newName });

    // Debounce the update call
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
    }, 500); // 500ms debounce
  };

  // Open modal for new item addition
  const openNewItemModal = (categoryId) => {
    setNewItemCategoryId(categoryId);
    setNewItemName("");
    setNewItemModalVisible(true);
  };

  // Function to add a new item to a specific category
  const addItemToCategory = async (item) => {
    const { image, name } = item;
    const newItem = {
      name: name,
      image: image,
      categoryId: newItemCategoryId,
      isStar: false,
      deviceID: userDetails?.deviceID,
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

  // Toggle editing mode for an image within a category
  const toggleImageEditing = (categoryId, index) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              images: category.images.map((img, i) =>
                i === index ? { ...img, editing: !img.editing } : img
              ),
            }
          : category
      )
    );
  };

  // Update the name of a specific image in a category
  const updateImageName = (categoryId, index, newName) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              images: category.images.map((img, i) =>
                i === index ? { ...img, name: newName, editing: false } : img
              ),
            }
          : category
      )
    );
  };

  // Delete a specific image from a category
  const deleteItem = async (categoryId, index, item) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
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
          },
        },
      ]
    );
  };

  // Toggle star status for an image within a category
  const toggleStar = async (categoryId, index, item) => {
    const updatedItem = { ...item, isStar: !item.isStar };
    await updateDocument(MyCollections.ITEMS, item.id, {
      isStar: updatedItem.isStar,
    });
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              images: category.images.map((img, i) =>
                i === index ? updatedItem : img
              ),
            }
          : category
      )
    );
  };

  const selectImage = (img) => {
    navigation.navigate(SCREENS.HOME, { newImage: img });
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
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Add separator here
        ListHeaderComponent={
          <View style={styles.addCategoryContainer}>
            <TextInput
              style={styles.newCategoryInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="New category name"
            />
            <TouchableOpacity
              onPress={addCategory}
              style={styles.addCategoryButton}
            >
              <Text style={styles.buttonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.categoryContainer}>
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
                <Text style={styles.categoryTitle}>{item.name}</Text>
              )}
              {!protectedCategoryIds.includes(item.id) && (
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
              <TouchableOpacity
                onPress={() => openNewItemModal(item.id)}
                style={styles.categoryIconButton}
              >
                <Icon name="plus" size={20} />
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={item.images}
              keyExtractor={(img) => img.id}
              renderItem={({ item: img, index }) => (
                <TouchableOpacity onPress={() => selectImage(img)}>
                  <View style={styles.imageContainer}>
                    <Image source={img.src} style={styles.image} />
                    {img.editing ? (
                      <TextInput
                        style={styles.imageTextInput}
                        value={img.name}
                        onChangeText={(newName) =>
                          updateImageName(item.id, index, newName)
                        }
                      />
                    ) : (
                      <Text style={styles.imageText}>{img.name}</Text>
                    )}
                    <View style={styles.iconContainer}>
                      <TouchableOpacity
                        onPress={() => toggleImageEditing(item.id, index)}
                      >
                        <Icon
                          name={img.editing ? "save" : "edit"}
                          size={16}
                          style={styles.editButton}
                        />
                      </TouchableOpacity>
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
                      {/* Star Icon */}
                      <TouchableOpacity
                        onPress={() => toggleStar(item.id, index, img)}
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
        )}
      />

      {/* Modal for Adding New Item */}
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
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Adjust background color to your preference
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd", // Change this color to your preference
    marginVertical: 10, // Adjust the margin as needed
  },
  categoryContainer: {
    marginBottom: 20,
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
    width: 60,
    height: 60,
  },
  imageText: {
    textAlign: "center",
  },
  imageTextInput: {
    textAlign: "center",
    borderBottomWidth: 1,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  editButton: {
    marginHorizontal: 5,
  },
  deleteButton: {
    marginHorizontal: 5,
  },
  starButton: {
    marginHorizontal: 5,
  },
  addCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20, // Adjust this value as needed
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
