import React from 'react'
import { useGroupData } from '../utils/firebaseHooks'
import Player from './player'

interface GroupProps {
  gameID: string,
  groupID: string
}

const Group = ({gameID,groupID}:GroupProps) => {
  const [groupData, loading, error] = useGroupData(gameID, groupID)
  if(!groupData || loading || error)
    return <p>Loading...</p>

  const players = groupData.playerIDs.map(pid=><Player key={`group-${pid}`} id={pid} />)
  return (
    <div>
      <h3>{groupData.name}</h3>
      {players}
    </div>
  )
}

export default Group
