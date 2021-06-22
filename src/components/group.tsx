import React from "react";
import { joinGroup } from "../utils/firebaseFunctions";
import { IGroup } from "../utils/firebaseHooks";
import Player from "./player";

interface GroupProps {
  groupData: IGroup;
  gameID: string;
}

const Group = ({ groupData, gameID }: GroupProps) => {
  console.log("🚀 ~ file: group.tsx ~ line 11 ~ Group ~ groupData", groupData);
  const players = groupData.playerIDs.map((pid) => (
    <Player key={`group-${pid}`} id={pid} />
  ));

  const handleJoinGroup = () => {
    joinGroup(gameID, groupData.id);
  };

  return (
    <div>
      <h3>{groupData.name}</h3>
      <button onClick={handleJoinGroup}>Join group</button>
      {players}
    </div>
  );
};

export default Group;
