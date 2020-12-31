import { useLayoutEffect, useState } from "react";
import { gameStore } from "../util/gameStore";

const Game = () => {
  // const { gameID, playerID, newGame } = useContext(GameContext);
  const [player, setPlayer] = useState(gameStore.playerInitialState);
  useLayoutEffect(() => {
    const subscription = gameStore.subscribe(setPlayer);
    gameStore.init();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <button onClick={gameStore.newGame}>New Game</button>
      <p>Game: {player.gameID}</p>
      <p>Player: {player.playerID}</p>
    </div>
  );
};

export default Game;
