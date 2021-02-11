import React, { useContext } from "react";
import {
  logout,
  useAuthStatePrimed,
  useGetAllGamesNames,
} from "../firebaseHooks";
import { UserContext } from "../utils/userContext";

const Games = () => {
  const [names, loading, error] = useGetAllGamesNames();
  const { baseUser, userData } = useContext(UserContext);
  let nameListItems;
  if (!loading) {
    nameListItems = names.map((name: string) => <li>{name}</li>);
  }
  return (
    <div>
      Welcome {userData?.name}
      {error ? <h1>ERROR</h1> : <ul>{nameListItems}</ul>}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};

export default Games;
