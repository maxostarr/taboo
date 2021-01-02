import { useLayoutEffect, useState } from "react";
import { ConnectionState } from "../../../shared/src/defs";
import { gameStore } from "../util/gameStore";

const Game = () => {
  // const { gameID, playerID, newGame } = useContext(GameContext);
  const [player, setPlayer] = useState(gameStore.playerInitialState);
  const [game, setGame] = useState(gameStore.gameInitialState);
  const [connection, setConnection] = useState(
    gameStore.connectionInitialState,
  );

  const [gameIdToJoin, setGameIdToJoin] = useState("");
  useLayoutEffect(() => {
    const playerSubscription = gameStore.subscribePlayer(setPlayer);
    const gameSubscription = gameStore.subscribeGame(setGame);
    const connectionSubscription = gameStore.subscribeConnection(setConnection);
    gameStore.init();
    return () => {
      playerSubscription.unsubscribe();
      gameSubscription.unsubscribe();
      connectionSubscription.unsubscribe();
    };
  }, []);

  const groups: {
    [key: string]: string[];
  } = {};

  game.players.forEach((p) => {
    if (!p.groupID) {
      if (!groups["waiting"]) {
        groups["waiting"] = [];
      }
      groups["waiting"].push(p.playerID);
      return;
    }
    if (!groups[p.groupID]) {
      groups[p.groupID] = [];
    }
    groups[p.groupID].push(p.playerID);
  });

  const joinGame = () => gameStore.joinGame(gameIdToJoin);
  const joinGroup = (groupID: string) => gameStore.joinGroup(groupID);
  const newGroup = () => gameStore.joinGroup();
  const clearPlayer = () => localStorage.removeItem("jwt");

  return (
    <div>
      <p>
        {(() => {
          switch (connection) {
            case ConnectionState.CLOSED:
              return "CLOSED";
            case ConnectionState.OPEN:
              return "OPEN";
            case ConnectionState.CONNECTING:
              return "CONNECTING";
          }
        })()}
      </p>
      <div>
        <button onClick={gameStore.newGame}>New Game</button>
        <button onClick={clearPlayer}>Clear Player</button>
        <p>Game: {player.gameID}</p>
        <p>Player: {player.playerID}</p>
        <p>Group: {player.groupID}</p>
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
        <button onClick={newGroup}>New Group</button>
      </div>
      <div>
        {Object.keys(groups).map((group) => (
          <div onClick={() => joinGroup(group)}>
            Group: {group}
            <p>
              Players:
              {groups[group].map((p) => (
                <p>{p}</p>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
