import {
  useCollectionData,
  useDocumentData,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import "firebase/functions";
import firebase from "firebase";
import { firebaseConfig } from "../firebase.config";
export const app = firebase.initializeApp(firebaseConfig);

const authProvider = new firebase.auth.GoogleAuthProvider();
// authProvider.addScope("email");
// authProvider.addScope("user_friends");

export interface UserData {
  name: string;
}
export interface Game {
  name: string;
  state: string;
  createdAt: number;
  leader: string;
  playerIDs: string[];
  players?: UserData[];
}

export interface Group {
  name: string,
  playerIDs: string[];
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

export const login = async () => {
  await firebase.auth().signInWithPopup(authProvider);
};

export const logout = () => {
  firebase.auth().signOut();
};

export const useUserDataOnce = (id: string | undefined) => {
  return useDocumentDataOnce<UserData>(
    firebase.firestore().collection("players").doc(id),
  );
};

export const useUserData = (userID: string | undefined) => {
  return useDocumentData<UserData>(
    firebase.firestore().collection("players").doc(userID),
  );
};

export const useGameData = (gameID: string) => {
  return useDocumentData<Game>(
    firebase.firestore().collection("games").doc(gameID),
  );
};

export const useAuthStatePrimed = () => {
  return useAuthState(firebase.auth());
};

export const useGroupData = (gameID: string, groupID: string) => {
  return useDocumentData<Group>(
    firebase
      .firestore()
      .collection("games")
      .doc(gameID)
      .collection("groups")
      .doc(groupID)
  )
}