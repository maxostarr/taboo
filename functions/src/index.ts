import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';


admin.initializeApp();
// var db = app.database();
const db = admin.firestore()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const createPlayerForNewUser = functions.auth.user().onCreate((user) => {
  functions.logger.log(`New user: ${user.uid}`)
  const newPlayerData = {
    name: user.displayName,
    role: "user"
  }
  db.collection("players").doc(user.uid).set(newPlayerData)
});