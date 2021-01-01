import { useLayoutEffect, useState } from "react";
import { gameStore } from "../util/gameStore";

const Game = () => {
  // const { gameID, playerID, newGame } = useContext(GameContext);
  const [player, setPlayer] = useState(gameStore.playerInitialState);
  const [game, setGame] = useState(gameStore.gameInitialState);

  const [gameIdToJoin, setGameIdToJoin] = useState("");
  useLayoutEffect(() => {
    const playerSubscription = gameStore.subscribePlayer(setPlayer);
    const gameSubscription = gameStore.subscribeGame(setGame);
    gameStore.init();
    return () => {
      playerSubscription.unsubscribe();
      gameSubscription.unsubscribe();
    };
  }, []);

  const joinGame = () => gameStore.joinGame(gameIdToJoin);
  const clearPlayer = () => localStorage.removeItem("jwt");
  return (
    <div>
      <div>
        <button onClick={gameStore.newGame}>New Game</button>
        <button onClick={clearPlayer}>Clear Player</button>
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
      <div>
        {game.players.map((player) => (
          <p key={player.playerID}>{player.playerID}</p>
        ))}
      </div>
    </div>
  );
};

export default Game;
