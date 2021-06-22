import React from "react";
import { useGroupsData } from "../utils/firebaseHooks";
import Group from "./group";

export interface GroupsProps {
  gameID: string;
}

const Groups = ({ gameID }: GroupsProps) => {
  const [groups] = useGroupsData(gameID);
  console.log("🚀 ~ file: groups.tsx ~ line 10 ~ Groups ~ groups", groups);
  const groupsList = groups?.map((groupData) => (
    <Group groupData={groupData} key={`group-listing-${groupData.name}`} />
  ));
  return <div>{groupsList}</div>;
};

export default Groups;
