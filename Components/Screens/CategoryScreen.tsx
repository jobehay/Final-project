import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  createDocument,
  deleteDocument,
  readDocuments,
  updateDocument,
} from "../../Services/Firebase/firebaseAPI";
import { MyCollections } from "../../Services/Firebase/collectionNames";

// Example images for demonstration purposes
const defaultImages = [
  {
    src: require("../../assets/dragdrop/person.png"),
    name: "I",
    starred: false,
  },
  {
    src: require("../../assets/dragdrop/mom.png"),
    name: "mom",
    starred: false,
  },
  {
    src: require("../../assets/dragdrop/apple.png"),
    name: "Apple",
    starred: false,
  },
  {
    src: require("../../assets/dragdrop/iwonttoeat.png"),
    name: "I Want to Eat",
    starred: false,
  },
];

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemModalVisible, setNewItemModalVisible] = useState(false);
  const [newItemCategoryId, setNewItemCategoryId] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingCategoryNames, setEditingCategoryNames] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesFromFirebase = await readDocuments(
        MyCollections.CATEGORIES
      );
      setCategories(
        categoriesFromFirebase.map((category: any) => ({
          id: category.id,
          name: category.name,
          images: [], // You may want to fetch and include images if stored in Firebase
          editing: false,
        }))
      );
    };
    fetchCategories();
  }, []);

  // Function to add a new, empty category
  const addCategory = async () => {
    if (newCategoryName.trim() === "") return;

    // Create the new category in Firebase
    const newCategoryId = await createDocument(MyCollections.CATEGORIES, {
      name: newCategoryName,
    });

    if (newCategoryId) {
      // Update the local state
      setCategories([
        ...categories,
        {
          id: newCategoryId,
          name: newCategoryName,
          images: [], // Empty array for images
          editing: false,
        },
      ]);
      setNewCategoryName("");
    }
  };

  // Function to delete a category by ID
  const deleteCategory = async (id) => {
    await deleteDocument(MyCollections.CATEGORIES, id);
    setCategories(categories.filter((category) => category.id !== id));
  };

  // Toggle editing mode for a category title
  const toggleCategoryEditing = (id) => {
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
  const addItemToCategory = async () => {
    await createDocument(MyCollections.ITEMS, {
      name: newItemName,
      image:
        "https://firebasestorage.googleapis.com/v0/b/communivoice-bea29.appspot.com/o/person.png?alt=media&token=ed4ad5e8-ffcd-4c87-be29-6c960751f664",
      categoryId: newItemCategoryId,
    });
    setCategories(
      categories.map((category) =>
        category.id === newItemCategoryId
          ? {
              ...category,
              images: [
                ...category.images,
                {
                  src: require("../../assets/dragdrop/person.png"),
                  name: newItemName,
                  editing: false,
                  starred: false,
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
    const { name } = item;
    const items = await readDocuments(MyCollections.ITEMS);
    const itemByCategoryId = items.filter(
      (item: any) => item.categoryId === String(categoryId)
    );
    const itemId = itemByCategoryId.filter((item: any) => item.name === name)[0]
      .id;

    await deleteDocument(MyCollections.ITEMS, itemId);

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
  };

  // Toggle star status for an image within a category
  const toggleStar = async (categoryId, index) => {
    // const selectedCategory = categories.filter(
    //   (category) => Number(category.id) === Number(categoryId)
    // );
    // const selectedImage = selectedCategory[0].images.map((image, idx) => {
    //   if (index === idx) {
    //     return image;
    //   }
    // })[0];
    // const favoriteImages = await readDocuments(MyCollections.FAVORITE_IMAGES);
    // const imageee =
    //   "https://firebasestorage.googleapis.com/v0/b/communivoice-bea29.appspot.com/o/person.png?alt=media&token=ed4ad5e8-ffcd-4c87-be29-6c960751f664";
    // const favoriteImage = favoriteImages.filter((img) => img.image === imageee); //selectedImage.name
    // if (favoriteImage.length) {
    //   const favoriteImage = favoriteImages.filter(
    //     (img) => img.image === imageee
    //   )[0];
    //   const docId = favoriteImage.id;
    //   await deleteDocument(MyCollections.FAVORITE_IMAGES, docId);
    // } else {
    //   await createDocument(MyCollections.FAVORITE_IMAGES, {
    //     name_en: selectedImage.name,
    //     name_ar: selectedImage.name,
    //     name_he: selectedImage.name,
    //     image:
    //       "https://firebasestorage.googleapis.com/v0/b/communivoice-bea29.appspot.com/o/person.png?alt=media&token=ed4ad5e8-ffcd-4c87-be29-6c960751f664",
    //   });
    // }
    // setCategories(
    //   categories.map((category) =>
    //     category.id === categoryId
    //       ? {
    //           ...category,
    //           images: category.images.map((img, i) =>
    //             i === index ? { ...img, starred: !img.starred } : img
    //           ),
    //         }
    //       : category
    //   )
    // );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
              <TouchableOpacity
                onPress={() => openNewItemModal(item.id)}
                style={styles.categoryIconButton}
              >
                <Icon name="plus" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal>
              {item.images.map((img, index) => (
                <View key={index} style={styles.imageContainer}>
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
                      onPress={() => toggleStar(item.id, index)}
                    >
                      <Icon
                        name={img.starred ? "star" : "star-o"}
                        size={16}
                        color="gold"
                        style={styles.starButton}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      />

      {/* Modal for Adding New Item */}
      <Modal visible={newItemModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            value={newItemName}
            onChangeText={setNewItemName}
            placeholder="New item name"
          />
          <TouchableOpacity
            onPress={addItemToCategory}
            style={[styles.modalButton, styles.addButton]}
          >
            <Text style={styles.buttonText}>Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNewItemModalVisible(false)}
            style={[styles.modalButton, styles.cancelButton]}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Section for adding a new category */}
      <View style={styles.addCategoryContainer}>
        <TextInput
          style={styles.input}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  separator: {
    height: 20,
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
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    marginRight: 10,
  },
  addCategoryButton: {
    backgroundColor: "blue",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: "80%",
  },
  addButton: {
    backgroundColor: "blue",
  },
  cancelButton: {
    backgroundColor: "gray",
  },
});

export default CategoryManager;
