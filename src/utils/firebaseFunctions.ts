import firebase from "firebase";
firebase.functions()

const addNewGameFunction = firebase.functions().httpsCallable("createNewGame")
const joinGameFunction = firebase.functions().httpsCallable("joinGame")

export const addNewGame = (name: string) => addNewGameFunction(name);
export const joinGame = (id: string) => joinGameFunction(id);