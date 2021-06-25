import { createContext, FunctionComponent } from "react";
import { IUserData, useAuthStatePrimed, useUserData } from "./firebaseHooks";

interface IUserContext {
  baseUser: any;
  userData: IUserData | undefined;
  loading: boolean;
  error: string;
}

export const UserContext = createContext({} as IUserContext);

export const UserContextProvider: FunctionComponent = ({ children }) => {
  const [baseUser, loading, error] = useAuthStatePrimed();
  const [userData] = useUserData(baseUser?.uid);
  return (
    <UserContext.Provider value={{ baseUser, userData, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
