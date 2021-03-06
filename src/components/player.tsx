import { useUserData } from "../utils/firebaseHooks";

interface PlayerProps {
  id: string;
}

const Player = ({ id }: PlayerProps) => {
  const [player] = useUserData(id);
  if (!player) return <p>Error loading player</p>;
  return <div>{player.name}</div>;
};

export default Player;
