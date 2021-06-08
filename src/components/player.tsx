import React from 'react'
import { useUserData } from '../firebaseHooks'

interface PlayerProps {
  id: string
}

const Player = ({id}: PlayerProps) => {
  const [player, loading, error] = useUserData(id)
  return (
    <div>
      {Player.name}
    </div>
  )
}

export default Player
