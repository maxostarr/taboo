import { Subject } from "rxjs";
import jsonwebtoken from "jsonwebtoken";
import { GameState, MessageType } from "../../../shared/src/defs";
import { isJSDocUnknownType } from "typescript";

const connection = new WebSocket("ws://localhost:3000/ws");

const player = new Subject();
const game = new Subject();

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

let playerState = playerInitialState;
let gameState = gameInitialState;

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
          players: [...gameState.players, jwt],
        };
        game.next(gameState);
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case MessageType.JOIN: {
      try {
        const jwt = jsonwebtoken.decode(message.payload);
        localStorage.setItem("jwt", message.payload);
        player.next(jwt);
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
    case MessageType.PLAYERS_LIST: {
      try {
        const players = JSON.parse(message.payload);
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
  },

  subscribePlayer: (setState: (value: any) => void) =>
    player.subscribe(setState),
  subscribeGame: (setState: (value: any) => void) => game.subscribe(setState),

  gameInitialState,
  playerInitialState,

  newGame: () => {
    gameState = gameInitialState;
    game.next(gameState);
    sendToServer({ type: MessageType.NEW, payload: null });
  },

  joinGame: (gameID: string) => {
    sendToServer({
      type: MessageType.JOIN,
      payload: {
        gameID,
      },
    });
  },
};
