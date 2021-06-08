import React from "react";
import { useRouteMatch } from "react-router";
import Player from "../components/player";
import { useGameData, useUserData } from "../utils/firebaseHooks";

const Game = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  const [game, game_loading, game_error] = useGameData(id);
  const [leader, leader_loading, leader_error] = useUserData(game?.leader);
  const players = game?.playerIDs.map(p=><Player id={p} />)
  // console.log("🚀 ~ file: game.tsx ~ line 6 ~ params", params);
  // const { id } = params;

  return (
    <div>
      <p>{id}</p>
      <p>{leader?.name}</p>
      <h2>Players</h2>
      {players}
    </div>
  );
  // return <div></div>;
};

export default Game;
