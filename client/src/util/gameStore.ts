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

connection.onmessage = ({ data }) => {
  console.log(data);
  const message = JSON.parse(data);
  console.log(message);

  switch (message.type) {
    case MessageType.NEW: {
      try {
        const jwt = jsonwebtoken.decode(message.payload) as Player;
        localStorage.setItem("jwt", message.payload);
        player.next(jwt);
        gameState = {
          ...gameState,
          players: [jwt],
        };
        game.next(gameState);
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case MessageType.JOIN_GAME: {
      try {
        const jwt = jsonwebtoken.decode(message.payload) as Player;
        localStorage.setItem("jwt", message.payload);
        playerState = jwt;
        player.next(playerState);
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case MessageType.ADD_PLAYER: {
      try {
        const jwt = jsonwebtoken.decode(message.payload) as Player;
        gameState = {
          ...gameState,
          players: [...gameState.players, jwt],
        };
        game.next(gameState);
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case MessageType.UPDATE_PLAYER: {
      try {
        const jwt = jsonwebtoken.decode(message.payload) as Player;
        console.log({ jwt, playerState });

        if (jwt.playerID === playerState.playerID) {
          playerState = jwt;
          player.next(playerState);
          localStorage.setItem("jwt", message.payload);
        }
        gameState.players = gameState.players.map((p) => {
          if (p.playerID !== jwt.playerID) {
            return p;
          }
          return jwt;
        });

        game.next({ ...gameState });
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case MessageType.PLAYERS_LIST: {
      try {
        const players = JSON.parse(message.payload);
        gameState = {
          ...gameState,
          players,
        } as Game;
        game.next({
          ...gameState,
          players,
        } as Game);
      } catch (e) {
        console.log(e);
      }
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

  joinGroup: (groupID: string) => {
    sendToServer({
      type: MessageType.JOIN_GROUP,
      payload: {
        groupID,
      },
    });
  },
};
