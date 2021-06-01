import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { logout, addNewGame, useGetAllGamesNames } from "../firebaseHooks";
import { UserContext } from "../utils/userContext";

const Games = () => {
  const [games, loading, error] = useGetAllGamesNames();
  const { baseUser, userData } = useContext(UserContext);
  let nameListItems;
  if (!loading && games) {
    nameListItems = games.map((game: any) => (
      <li key={game.id}>
        <Link to={game.id}>{game.name}</Link>
      </li>
    ));
  }
  return (
    <div>
      Welcome {userData?.name}
      {error ? <h1>ERROR</h1> : <ul>{nameListItems}</ul>}
      <button onClick={addNewGame}>New Game</button>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};

export default Games;
