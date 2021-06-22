import React from "react";
import { IGroup } from "../utils/firebaseHooks";
import Player from "./player";

interface GroupProps {
  groupData: IGroup;
}

const Group = ({ groupData }: GroupProps) => {
  const players = groupData.playerIDs.map((pid) => (
    <Player key={`group-${pid}`} id={pid} />
  ));
  return (
    <div>
      <h3>{groupData.name}</h3>
      {players}
    </div>
  );
};

export default Group;
