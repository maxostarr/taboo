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

export enum PlayerState {
  "judging",
  "reading",
  "guessing",
}
export interface IUserData {
  name: string;
  game: string;
  state: PlayerState;
}

export interface IBaseUser {
  uid: string;
}
export interface IGame {
  name: string;
  state: string;
  createdAt: number;
  leader: string;
  playerIDs: string[];
  players?: IUserData[];
}

export interface IGroup {
  name: string;
  playerIDs: string[];
  id: string;
}

export const useGetAllGamesNames = () => {
  const [value, loading, error] = useCollectionData<IGame>(
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
          ] as any as IGame[],
          loading,
          error,
        ] as const);
  }

  return [[] as any as IGame[], loading, error] as const;
};

export const login = async () => {
  await firebase.auth().signInWithPopup(authProvider);
};

export const logout = () => {
  firebase.auth().signOut();
};

export const useUserDataOnce = (id: string | undefined) => {
  return useDocumentDataOnce<IUserData>(
    firebase.firestore().collection("players").doc(id),
  );
};

export const useUserData = (userID: string | undefined) => {
  return useDocumentData<IUserData>(
    firebase.firestore().collection("players").doc(userID),
  );
};

export const useGameData = (gameID: string) => {
  return useDocumentData<IGame>(
    firebase.firestore().collection("games").doc(gameID),
  );
};

export const useAuthStatePrimed = () => {
  return useAuthState(firebase.auth());
};

export const useGroupData = (gameID: string, groupID: string) => {
  return useDocumentData<IGroup>(
    firebase
      .firestore()
      .collection("games")
      .doc(gameID)
      .collection("groups")
      .doc(groupID),
  );
};

export const useGroupsData = (gameID: string) => {
  return useCollectionData<IGroup>(
    firebase.firestore().collection("games").doc(gameID).collection("groups"),
    {
      idField: "id",
    },
  );
};
