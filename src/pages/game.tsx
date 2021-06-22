import firebase from "firebase";
import React, { useContext } from "react";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import Groups from "../components/groups";
import Player from "../components/player";
import { joinGame } from "../utils/firebaseFunctions";
import {
  useAuthStatePrimed,
  useGameData,
  useUserData,
} from "../utils/firebaseHooks";

const Game = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  // const { baseUser, userData } = useContext(UserContext);
  const [user] = useAuthStatePrimed();
  const [game] = useGameData(id);
  const [leader] = useUserData(game?.leader);
  // console.log("🚀 ~ file: game.tsx ~ line 6 ~ params", params);
  // const { id } = params;
  if (!user || !leader || !game) return <p>Loading...</p>;

  const players = game?.playerIDs.map((pid) => <Player key={pid} id={pid} />);

  // const groups = game?.groups.map(pid=><Player key={pid} id={pid} />);
  console.log("🚀 ~ file: game.tsx ~ line 17 ~ Game ~ game", game);
  if (user && game.state === "starting" && !game?.playerIDs.includes(user.uid))
    joinGame(id);

  return (
    <div>
      <Link to="/">Home</Link>
      <p>{game.name}</p>
      <p>{leader?.name}</p>
      <h2>Players</h2>
      {players}
      <Groups gameID={id} />
    </div>
  );
  // return <div></div>;
};

export default Game;
