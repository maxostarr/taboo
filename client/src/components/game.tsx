import { useLayoutEffect, useState } from "react";
import { gameStore } from "../util/gameStore";

const Game = () => {
  // const { gameID, playerID, newGame } = useContext(GameContext);
  const [player, setPlayer] = useState(gameStore.playerInitialState);
  const [gameIdToJoin, setGameIdToJoin] = useState("");
  useLayoutEffect(() => {
    const subscription = gameStore.subscribe(setPlayer);
    gameStore.init();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const joinGame = () => gameStore.joinGame(gameIdToJoin);

  return (
    <div>
      <div>
        <button onClick={gameStore.newGame}>New Game</button>
        <p>Game: {player.gameID}</p>
        <p>Player: {player.playerID}</p>
      </div>
      <div>
        <input
          type="text"
          name="GameID"
          id="gameid"
          placeholder="Game ID"
          value={gameIdToJoin}
          onChange={(e) => setGameIdToJoin(e.target.value)}
        />
        <button onClick={joinGame}>Join Game</button>
      </div>
    </div>
  );
};

export default Game;
