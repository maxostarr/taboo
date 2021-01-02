interface Player {
  websocket: import("ws").WebSocket | undefined;
  playerID: string;
  groupID: string | null;
  gameID: string;
}

interface Game {
  players: Player[];
  state: GameState;
}

interface JoinGameOptions {
  jwt: string | null;
  gameID: string;
  groupID: string | null;
}
interface JoinGroupOptions {
  jwt: string;
  groupID: string | null;
}

interface NewGameOptions {
  jwt: string | null;
}

interface Message {
  type: MessageType;
  payload: JoinGameOptions | NewGameOptions | JoinGroupOptions | any;
}
