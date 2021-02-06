import React from "react";
import { logout, useGetAllGamesNames } from "../firebaseHooks";

const Games = () => {
  const [names, loading, error] = useGetAllGamesNames();
  let nameListItems;
  if (!loading) {
    nameListItems = names.map((name: string) => <li>{name}</li>);
  }
  return (
    <div>
      {error ? <h1>ERROR</h1> : <ul>{nameListItems}</ul>}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};

export default Games;
