import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
// var db = app.database();
const db = admin.firestore();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const createPlayerForNewUser = functions.auth.user().onCreate((user) => {
  functions.logger.log(`New user: ${user.uid}`);
  const newPlayerData = {
    name: user.displayName,
    role: "user",
    game: "",
  };
  db.collection("players").doc(user.uid).set(newPlayerData);
});

export const createNewGame = functions.https.onCall(async (name, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }
  const newGameData = {
    name,
    state: "starting",
    createdAt: Date.now(),
    leader: context.auth.uid,
    playerIDs: [context.auth.uid],
    wordsToPlay: [],
    playedWords: [],
  };
  const newGameDBEntry = await db.collection("games").add(newGameData);
  await newGameDBEntry.collection("groups").add({
    name: "Group 1",
    playerIDs: [context.auth.uid],
    points: 0,
  });
  return newGameDBEntry.id;
});

export const joinGame = functions.https.onCall(async (gameId, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }
  const user = await db.collection("players").doc(context.auth.uid).get();
  const userData = user.data();
  if (userData && userData.game && userData.game !== gameId) {
    await db
      .collection("games")
      .doc(userData.game)
      .update({
        playerIDs: admin.firestore.FieldValue.arrayRemove(context.auth.uid),
      });
  }
  await db.collection("players").doc(context.auth.uid).update({
    game: gameId,
  });
  await db
    .collection("games")
    .doc(gameId)
    .update({
      playerIDs: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
    });
});

export const joinGroup = functions.https.onCall(
  async ({ gameId, groupId }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }
    await db
      .collection("games")
      .doc(gameId)
      .collection("groups")
      .doc(groupId)
      .update({
        playerIDs: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
      });
  },
);
