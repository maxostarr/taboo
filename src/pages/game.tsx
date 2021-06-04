import React from "react";
import { useRouteMatch } from "react-router";
import { useLeaderUserData, useUserDataOnce } from "../firebaseHooks";

const Game = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  const [leader, loading, error] = useLeaderUserData(id);
  console.log(id, leader, loading, error);

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
