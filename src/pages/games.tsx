import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { addNewGame } from "../utils/firebaseFunctions";
import { logout, useGetAllGamesNames } from "../utils/firebaseHooks";
import { UserContext } from "../utils/userContext";

const Games = () => {
  const history = useHistory();
  const [addingGame, setAddingGame] = useState(false);
  const [games, loading, error] = useGetAllGamesNames();
  const { userData } = useContext(UserContext);
  let nameListItems;
  if (!loading && games) {
    nameListItems = games.map((game: any) => (
      <li key={game.id}>
        <Link to={game.id}>{game.name}</Link>
      </li>
    ));
  }
  const handleAddNewGameClick = async () => {
    setAddingGame(true);
    const newGameID = await addNewGame(`${userData?.name}'s Game`);
    setAddingGame(false);
    history.push(`/${newGameID.data}`);
  };

  return (
    <div>
      Welcome {userData?.name}
      {error ? <h1>ERROR</h1> : <ul>{nameListItems}</ul>}
      {addingGame && <h2>Adding new game....</h2>}
      <button onClick={handleAddNewGameClick}>New Game</button>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};

export default Games;
