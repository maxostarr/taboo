import { Subject } from "rxjs";
import jsonwebtoken from "jsonwebtoken";
import {
  GameState,
  MessageType,
  ConnectionState,
} from "../../../shared/src/defs";

const connection = new WebSocket("ws://localhost:3000/ws");

const player = new Subject();
const game = new Subject();
const serverConnection = new Subject();

game.subscribe(console.log);

const playerInitialState = {
  playerID: "",
  gameID: "",
  groupID: "",
} as Player;

const gameInitialState = {
  players: [playerInitialState],
  state: GameState.NEW,
} as Game;

const connectionInitialState = ConnectionState.CONNECTING;

let playerState = playerInitialState;
let gameState = gameInitialState;
let connectionState = connectionInitialState;

connection.onclose = () => {
  connectionState = ConnectionState.CLOSED;
  serverConnection.next(connectionState);
};

connection.onopen = () => {
  connectionState = ConnectionState.OPEN;
  serverConnection.next(connectionState);
};

const updatePlayerState = (newState: Player) => {
  playerState = newState;
  player.next(playerState);
};

const updateGameState = (newState: Game) => {
  gameState = newState;
  game.next(gameState);
};

const newGame = (message: Message) => {
  try {
    const jwt = jsonwebtoken.decode(message.payload) as Player;
    localStorage.setItem("jwt", message.payload);

    updatePlayerState(jwt);
    updateGameState({
      ...gameState,
      players: [jwt],
    });
  } catch (e) {
    console.log(e);
  }
};

const joinGame = (message: Message) => {
  try {
    const jwt = jsonwebtoken.decode(message.payload) as Player;
    localStorage.setItem("jwt", message.payload);
    updatePlayerState(jwt);
  } catch (e) {
    console.log(e);
  }
};

const addPlayer = (message: Message) => {
  try {
    const jwt = jsonwebtoken.decode(message.payload) as Player;
    updateGameState({
      ...gameState,
      players: [...gameState.players, jwt],
    });
  } catch (e) {
    console.log(e);
  }
};
const updatePlayer = (message: Message) => {
  try {
    const jwt = jsonwebtoken.decode(message.payload) as Player;

    if (jwt.playerID === playerState.playerID) {
      updatePlayerState(jwt);
      localStorage.setItem("jwt", message.payload);
    }
    const newPlayers = gameState.players.map((p) => {
      if (p.playerID !== jwt.playerID) {
        return p;
      }
      return jwt;
    });
    updateGameState({
      ...gameState,
      players: newPlayers,
    });
  } catch (e) {
    console.log(e);
  }
};
const playerList = (message: Message) => {
  try {
    const players = JSON.parse(message.payload);
    updateGameState({
      ...gameState,
      players,
    } as Game);
  } catch (e) {
    console.log(e);
  }
};

connection.onmessage = ({ data }) => {
  console.log(data);
  const message = JSON.parse(data) as Message;
  console.log(message);

  switch (message.type) {
    case MessageType.NEW: {
      newGame(message);
      break;
    }
    case MessageType.JOIN_GAME: {
      joinGame(message);
      break;
    }
    case MessageType.ADD_PLAYER: {
      addPlayer(message);
      break;
    }
    case MessageType.UPDATE_PLAYER: {
      updatePlayer(message);
      break;
    }
    case MessageType.PLAYERS_LIST: {
      playerList(message);
      break;
    }
  }
};

const sendToServer = (data: Message) => {
  let jwt = localStorage.getItem("jwt");
  // if (jwt) {
  connection.send(
    JSON.stringify({
      ...data,
      payload: {
        ...data.payload,
        jwt,
      },
    }),
  );
  // }
  // connection.send(JSON.stringify(data));
};

export const gameStore = {
  init: () => {
    playerState = { ...playerState };
    gameState = { ...gameState };
    player.next(playerState);
    game.next(gameState);
    serverConnection.next(connectionState);
  },

  subscribePlayer: (setState: (value: any) => void) =>
    player.subscribe(setState),
  subscribeGame: (setState: (value: any) => void) => game.subscribe(setState),
  subscribeConnection: (setState: (value: any) => void) =>
    serverConnection.subscribe(setState),

  gameInitialState,
  playerInitialState,
  connectionInitialState,

  newGame: () => {
    gameState = gameInitialState;
    game.next(gameState);
    sendToServer({ type: MessageType.NEW, payload: null });
  },

  joinGame: (gameID: string) => {
    sendToServer({
      type: MessageType.JOIN_GAME,
      payload: {
        gameID,
      },
    });
  },

  joinGroup: (groupID: string | null = null) => {
    sendToServer({
      type: MessageType.JOIN_GROUP,
      payload: {
        groupID,
      },
    });
  },
};
