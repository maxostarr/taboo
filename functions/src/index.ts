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
    // this can possible fail as the old game may have been removed.
    // That's fine though since then nothing needs to be done, so we catch and ignore the error
    try {
      await db
        .collection("games")
        .doc(userData.game)
        .update({
          playerIDs: admin.firestore.FieldValue.arrayRemove(context.auth.uid),
        });
    } catch {}
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

export const createNewGroupIfNeeded = functions.firestore
  // .ref("/games/{gameId}/groups/{groupId}/playerIDs")
  .document("games/{gameId}/groups/{groupId}")
  .onUpdate(async (change, context) => {
    const { gameId } = context.params;
    const groupsDbRef = db.collection("games").doc(gameId).collection("groups");
    const groups = await groupsDbRef.get();
    let groupNeeded = true;
    for (const group of groups.docs) {
      const data = group.data();
      if (data.playerIDs.length < 2) {
        groupNeeded = false;
        break;
      }
    }
    if (groupNeeded) {
      await groupsDbRef.add({
        name: `Group ${groups.docs.length + 1}`,
        playerIDs: [],
        points: 0,
      });
    }
  });
