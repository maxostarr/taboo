import { Subject } from "rxjs";
import jsonwebtoken from "jsonwebtoken";
import { MessageType } from "../../../shared/src/defs";

const connection = new WebSocket("ws://localhost:3000/ws");
const player = new Subject();

const playerInitialState = {
  playerID: "",
  gameID: "",
  groupID: "",
} as Player;

let playerState = playerInitialState;

connection.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  switch (message.type) {
    case MessageType.NEW: {
      try {
        const jwt = jsonwebtoken.decode(message.payload);
        player.next(jwt);
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case MessageType.JOIN: {
      try {
        const jwt = jsonwebtoken.decode(message.payload);
        player.next(jwt);
      } catch (e) {
        console.log(e);
      }
      break;
    }
  }
};

export const gameStore = {
  init: () => {
    playerState = { ...playerState };
    player.next(playerState);
  },

  subscribe: (setState: (value: any) => void) => player.subscribe(setState),

  playerInitialState,

  newGame: () => {
    connection.send(
      JSON.stringify({
        type: MessageType.NEW,
      }),
    );
  },
};
