interface Player {
  websocket: import("ws").WebSocket | undefined;
  playerID: string;
  groupID: string;
  gameID: string;
}

interface Game {
  players: Player[];
  state: GameState;
}

interface JoinOptions {
  jwt: string | null;
  gameID: string;
  groupID: string | null;
}

interface NewGameOptions {
  jwt: string | null;
}

interface Message {
  type: MessageType;
  payload: JoinOptions | NewGameOptions | any;
}
