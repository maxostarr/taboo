import React from "react";
import { useGroupsData } from "../utils/firebaseHooks";
import Group from "./group";

export interface GroupsProps {
  gameID: string;
}

const Groups = ({ gameID }: GroupsProps) => {
  const [groups] = useGroupsData(gameID);
  const groupsList = groups?.map((groupData) => (
    <Group
      groupData={groupData}
      gameID={gameID}
      key={`group-listing-${groupData.name}`}
    />
  ));
  return <div>{groupsList}</div>;
};

export default Groups;
