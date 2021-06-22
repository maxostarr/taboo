import firebase from "firebase";
firebase.functions();

const addNewGameFunction = firebase.functions().httpsCallable("createNewGame");
const joinGameFunction = firebase.functions().httpsCallable("joinGame");
const joinGroupFunction = firebase.functions().httpsCallable("joinGroup");

export const addNewGame = (name: string) => addNewGameFunction(name);
export const joinGame = (id: string) => joinGameFunction(id);
export const joinGroup = (gameId: string, groupId: string) =>
  joinGroupFunction({ gameId, groupId });
