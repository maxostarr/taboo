import { useContext } from "react";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import Groups from "../components/groups";
import Player from "../components/player";
import { joinGame, startGame } from "../utils/firebaseFunctions";
import {
  IUserData,
  PlayerState,
  useGameData,
  useUserData,
} from "../utils/firebaseHooks";
import { UserContext } from "../utils/userContext";

const getPlayerAction = (player: IUserData) => {
  switch (player.state) {
    case PlayerState.guessing:
      return <h2>Get ready to guess!</h2>;
    case PlayerState.reading:
      return <h2>Get ready to read!</h2>;
    case PlayerState.judging:
      return <h2>Get ready to judge!</h2>;
    default:
      return <h2 color="red">Something has gone wrong!!</h2>;
  }
};

const Game = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  const { baseUser, userData } = useContext(UserContext);
  const [game] = useGameData(id);
  const [leader] = useUserData(game?.leader);
  if (!baseUser || !userData || !leader || !game) return <p>Loading...</p>;

  const players = game?.playerIDs.map((pid) => <Player key={pid} id={pid} />);

  if (userData && game.state === "starting" && userData.game !== id)
    joinGame(id);

  const playerAction = getPlayerAction(userData);
  const handleStartGame = () => {
    startGame(id);
  };
  switch (game.state) {
    case "starting":
      return (
        <div>
          <Link to="/">Home</Link>
          <p>{game.name}</p>
          <p>{leader?.name}</p>
          <h2>Players</h2>
          {players}
          <Groups gameID={id} />
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      );

    case "ready":
      return (
        <div>
          <Link to="/">Home</Link>
          <p>{game.name}</p>
          {playerAction}
        </div>
      );
    default:
      return <h2 color="red">Something has gone wrong!!</h2>;
  }
  // return <div></div>;
};

export default Game;
