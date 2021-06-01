import React, { FunctionComponent } from "react";
import { RouteChildrenProps, useRouteMatch } from "react-router";

const Game: FunctionComponent = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  // console.log("🚀 ~ file: game.tsx ~ line 6 ~ params", params);
  // const { id } = params;

  return <div>{id}</div>;
  // return <div></div>;
};

export default Game;
