type GameID = string;
type PlayerID = string;

interface Player {
  _id: PlayerID;
  // websocket: import("ws").WebSocket | undefined;
  groupID: string | null;
  gameID: string;
}

interface Game {
  _id: GameID;
  players: PlayerID[];
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

interface Round {
  reader: PlayerID;
  guesser: PlayerID;
  groupID: string;
}
