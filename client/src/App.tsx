import "./App.css";
import { w3cwebsocket as WebSocket } from "websocket";
import { useEffect } from "react";
import { MessageType } from "../../shared/src/defs";
import GameContextProvider from "./util/gameContext";
import Game from "./components/game";

function App() {
  return (
    <GameContextProvider>
      <div className="App">
        <Game />
      </div>
    </GameContextProvider>
  );
}

export default App;
