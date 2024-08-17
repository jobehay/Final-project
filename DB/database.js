// database.js
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("ImageCardDatabase.db");

export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS imageCards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId TEXT,
        deviceID TEXT,
        deviceIdAndCategoryId TEXT,
        image TEXT,
        isCommon BOOLEAN,
        isStar BOOLEAN,
        name TEXT,
        name_ar TEXT,
        name_en TEXT,
        name_he TEXT
      );`,
      [],
      () => console.log("Table created successfully"),
      (tx, error) => console.log("Error creating table", error)
    );
  });
};

export const insertImageCard = (imageCard) => {
  const {
    categoryId,
    deviceID,
    deviceIdAndCategoryId,
    image,
    isCommon,
    isStar,
    name,
    name_ar,
    name_en,
    name_he,
  } = imageCard;
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO imageCards (categoryId, deviceID, deviceIdAndCategoryId, image, isCommon, isStar, name, name_ar, name_en, name_he) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [
        categoryId,
        deviceID,
        deviceIdAndCategoryId,
        image,
        isCommon,
        isStar,
        name,
        name_ar,
        name_en,
        name_he,
      ],
      () => console.log("Image card inserted successfully"),
      (tx, error) => console.log("Error inserting image card", error)
    );
  });
};

export const getImageCards = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM imageCards;",
      [],
      (tx, results) => {
        const rows = results.rows;
        let imageCards = [];
        for (let i = 0; i < rows.length; i++) {
          imageCards.push(rows.item(i));
        }
        callback(imageCards);
      },
      (tx, error) => console.log("Error fetching image cards", error)
    );
  });
};

export const deleteImageCard = (id) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM imageCards WHERE id = ?;",
      [id],
      () => console.log("Image card deleted successfully"),
      (tx, error) => console.log("Error deleting image card", error)
    );
  });
};

export const findImageCardByNameAndCategoryId = (name, categoryId) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM imageCards WHERE name = ? AND categoryId = ?;",
        [name, categoryId],
        (tx, results) => {
          const rows = results.rows;
          let imageCards = [];
          for (let i = 0; i < rows.length; i++) {
            imageCards.push(rows.item(i));
          }
          resolve(imageCards);
        },
        (tx, error) => {
          console.log("Error finding image card", error);
          reject(error);
        }
      );
    });
  });
};
