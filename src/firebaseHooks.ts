import {
  useCollection,
  useCollectionData,
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
// authProvider.addScope("email");
// authProvider.addScope("user_friends");

interface Game {
  name: string;
  state: string;
  createdAt: number;
  leader: string;
}

export const useGetAllGamesNames = () => {
  const [value, loading, error] = useCollectionData<Game>(
    firebase.firestore().collection("games"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
      idField: "id",
    },
  );
  if (!loading && !error) {
    // const names = value.docs.map((doc: any) => doc.data().name);
    // const ids = value.docs.map((doc: any) => doc.data().uid);
    // console.log(names, value.docs[0].data());

    return value
      ? ([value, loading, error] as const)
      : ([
          [
            {
              name: "No games",
              state: "INVALID",
            },
          ] as any as Game[],
          loading,
          error,
        ] as const);
  }

  return [[] as any as Game[], loading, error] as const;
};

export const addNewGame = () => {
  firebase
    .firestore()
    .collection("games")
    .add({
      name: "New Game",
      state: "starting",
      createdAt: Date.now(),
      leader: firebase.auth().currentUser?.uid,
    } as firebase.firestore.DocumentData);
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

export const useUserDataOnce = (id: string | undefined) => {
  return useDocumentDataOnce<UserData>(
    firebase.firestore().collection("players").doc(id),
  );
};

export const useLeaderUserData = (gameID: string) => {
  const [gameInfo] = useDocumentDataOnce<Game>(
    firebase.firestore().collection("games").doc(gameID),
  );
  return useUserDataOnce(gameInfo?.leader);
};

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
