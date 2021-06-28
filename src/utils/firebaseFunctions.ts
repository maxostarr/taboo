import firebase from "firebase";
firebase.functions();

const addNewGameFunction = firebase.functions().httpsCallable("createNewGame");
const joinGameFunction = firebase.functions().httpsCallable("joinGame");
const startGameFunction = firebase.functions().httpsCallable("startGame");
const joinGroupFunction = firebase.functions().httpsCallable("joinGroup");

export const addNewGame = (name: string) => addNewGameFunction(name);
export const joinGame = (id: string) => joinGameFunction(id);
export const startGame = (id: string) => startGameFunction(id);
export const joinGroup = (gameId: string, groupId: string) =>
  joinGroupFunction({ gameId, groupId });

export const cancelWord = async (gameID: string, word: string) =>
  firebase
    .firestore()
    .collection("games")
    .doc(gameID)
    .update({
      wordsToPlay: firebase.firestore.FieldValue.arrayRemove(word),
      playedWordsIncorrect: firebase.firestore.FieldValue.arrayUnion(word),
    });
export const correctWord = async (gameID: string, word: string) => {
  await firebase
    .firestore()
    .collection("games")
    .doc(gameID)
    .update({
      wordsToPlay: firebase.firestore.FieldValue.arrayRemove(word),
      playedWordsCorrect: firebase.firestore.FieldValue.arrayUnion(word),
    });
};
