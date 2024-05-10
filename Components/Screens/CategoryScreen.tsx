import React, { useState } from "react";
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
  const [categories, setCategories] = useState([
    {
      id: "1",
      name: "Person",
      images: [
        { ...defaultImages[0], editing: false },
        { ...defaultImages[1], editing: false },
      ],
      editing: false,
    },
    {
      id: "2",
      name: "Food",
      images: [
        { ...defaultImages[2], editing: false },
        { ...defaultImages[3], editing: false },
      ],
      editing: false,
    },
  ]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemModalVisible, setNewItemModalVisible] = useState(false);
  const [newItemCategoryId, setNewItemCategoryId] = useState(null);
  const [newItemName, setNewItemName] = useState("");

  // Function to add a new, empty category
  const addCategory = () => {
    if (newCategoryName.trim() === "") return;
    const newId = (categories.length + 1).toString();
    setCategories([
      ...categories,
      {
        id: newId,
        name: newCategoryName,
        images: [], // Empty array for images
        editing: false,
      },
    ]);
    setNewCategoryName("");
  };

  // Function to delete a category by ID
  const deleteCategory = (id) => {
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

  // Update the name of a specific category
  const updateCategoryName = (id, newName) => {
    setCategories(
      categories.map((category) =>
        category.id === id
          ? { ...category, name: newName, editing: false }
          : category
      )
    );
  };

  // Open modal for new item addition
  const openNewItemModal = (categoryId) => {
    setNewItemCategoryId(categoryId);
    setNewItemName("");
    setNewItemModalVisible(true);
  };

  // Function to add a new item to a specific category
  const addItemToCategory = () => {
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
  const deleteImage = (categoryId, index) => {
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
  const toggleStar = (categoryId, index) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              images: category.images.map((img, i) =>
                i === index ? { ...img, starred: !img.starred } : img
              ),
            }
          : category
      )
    );
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
                  value={item.name}
                  onChangeText={(newName) =>
                    updateCategoryName(item.id, newName)
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
                      onPress={() => deleteImage(item.id, index)}
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
