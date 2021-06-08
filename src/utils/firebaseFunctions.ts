import firebase from "firebase";
const { httpsCallable } = firebase.functions()

const createNewGame = httpsCallable("createNewGame")

export const addNewGame = (name: string) => createNewGame(name);