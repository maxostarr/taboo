import React from "react";
import { useRouteMatch } from "react-router";
import { useGameData, useUserDataOnce } from "../firebaseHooks";

const Game = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  const [game, game_loading, game_error] = useGameData(id);
  const [leader, leader_loading, leader_error] = useUserDataOnce(game?.leader);

  // console.log("🚀 ~ file: game.tsx ~ line 6 ~ params", params);
  // const { id } = params;

  return (
    <div>
      <p>{id}</p>
      <p>{leader?.name}</p>
    </div>
  );
  // return <div></div>;
};

export default Game;
