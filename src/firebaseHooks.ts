import {
  useCollection,
  useDocumentData,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase";
import { firebaseConfig } from "./firebase.config";
import { useEffect, useState } from "react";
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

export const login = async () => {
  await firebase.auth().signInWithPopup(authProvider);
};

export const logout = () => {
  firebase.auth().signOut();
};

interface UserData {
  name: string;
}

export const useUserData = (userID: string) => {
  return useDocumentData<UserData>(
    firebase.firestore().collection("players").doc(userID),
  );
};

export const useAuthStatePrimed = () => {
  // const [userData, setUserData] = useState({});
  return useAuthState(firebase.auth());
  // if (baseUser) {
  //   firebase
  //     .firestore()
  //     .collection("players")
  //     .doc(baseUser.uid)
  //     .onSnapshot((userSnapshot) => {
  //       const userSnapshotData = userSnapshot.data();
  //       console.log(userSnapshotData);
  //       console.log(baseUser.uid);

  //       if (userSnapshotData) setUserData(userSnapshotData);
  //     });
  // }
  // return [baseUser, userData, loading, error];
};
