const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deletePlant = functions.firestore
    .document("users/{userId}/plants/{plantId}")
    .onDelete((snap, context) => {
      return admin.firestore().recursiveDelete(snap.ref)
          .then(() => {
            functions.logger.log("Succes deleting", context.params.plantId);
            return {message: "Succes"};
          })
          .catch((e) => {
            functions.logger.log("Error deleting", context.params.plantId, e);
            return {message: `Error ${e}`};
          });
    });
