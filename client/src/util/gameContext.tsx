import React, { createContext, useState } from "react";
import { WSClient } from "./websocket";

interface ContextValue {
  gameID: string;
  playerID: string;
  newGame: () => void;
}

export const GameContext = createContext({} as ContextValue);
const wsclient = new WSClient();

interface PropTypes {
  children: React.ReactNode[] | React.ReactNode;
}

const GameContextProvider = ({ children }: PropTypes) => {
  const [playerID, setPlayerID] = useState("");
  const [gameID, setGameID] = useState("");

  const newGame = async () => {
    try {
      const player = await wsclient.newGame();
      setPlayerID(player.playerID);
      setGameID(player.gameID);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameID,
        playerID,
        newGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContextProvider;
