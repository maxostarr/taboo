import { createContext, FunctionComponent } from "react";
import { useAuthStatePrimed, useUserData } from "./firebaseHooks";

type UserData = {
  name: string;
};
interface UserContext {
  baseUser: object;
  userData: UserData | undefined;
  loading: boolean;
  error: string;
}

export const UserContext = createContext({} as UserContext);

export const UserContextProvider: FunctionComponent = ({ children }) => {
  const [baseUser, loading, error] = useAuthStatePrimed();
  const [userData] = useUserData(baseUser?.uid);
  return (
    <UserContext.Provider value={{ baseUser, userData, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
