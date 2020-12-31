import { useContext } from "react";
import { GameContext } from "../util/gameContext";

const Game = () => {
  const { gameID, playerID, newGame } = useContext(GameContext);
  return (
    <div>
      <button onClick={newGame}>New Game</button>
      Game: {gameID}
      Player: {playerID}
    </div>
  );
};

export default Game;
