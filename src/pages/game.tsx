import { useContext } from "react";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import Groups from "../components/groups";
import Player from "../components/player";
import { joinGame } from "../utils/firebaseFunctions";
import { useGameData, useUserData } from "../utils/firebaseHooks";
import { UserContext } from "../utils/userContext";

const Game = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  const { baseUser, userData } = useContext(UserContext);
  const [game] = useGameData(id);
  const [leader] = useUserData(game?.leader);
  if (!baseUser || !leader || !game) return <p>Loading...</p>;

  const players = game?.playerIDs.map((pid) => <Player key={pid} id={pid} />);

  if (userData && game.state === "starting" && userData.game !== id)
    joinGame(id);

  return (
    <div>
      <Link to="/">Home</Link>
      <p>{game.name}</p>
      <p>{leader?.name}</p>
      <h2>Players</h2>
      {players}
      <Groups gameID={id} />
    </div>
  );
  // return <div></div>;
};

export default Game;
