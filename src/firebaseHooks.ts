import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase";
import { firebaseConfig } from "./firebase.config";
// import { useStoredUsername } from "./localstorageHooks";
firebase.initializeApp(firebaseConfig);

const authProvider = new firebase.auth.GoogleAuthProvider();
authProvider.addScope("email");
// authProvider.addScope("user_friends");

export const useGetAllGamesNames = () => {
  const [value, loading, error] = useCollection(
    firebase.firestore().collection("games"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  if (!loading) {
    const names = value.docs.map((doc: any) => doc.data().name);
    console.log(names);

    return [names, loading, error];
  }
  return [undefined, loading, error];
};

export const login = () => {
  firebase.auth().signInWithPopup(authProvider);
};

export const logout = () => {
  firebase.auth().signOut();
};

export const useAuthStatePrimed = () => useAuthState(firebase.auth());
