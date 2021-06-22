import { createContext, FunctionComponent } from "react";
import { useAuthStatePrimed, useUserData } from "./firebaseHooks";

type UserData = {
  name: string;
};
interface IUserContext {
  baseUser: any;
  userData: UserData | undefined;
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
