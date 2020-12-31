import { MessageType } from "../../../shared/src/defs";
import jsonwebtoken from "jsonwebtoken";
export class WSClient {
  private connection = new WebSocket("ws://localhost:3000/ws");

  onOpen = console.log;
  onClose = console.log;

  constructor() {
    // onClose: (this: WebSocket, ev: Event) => any, // onMessage: (this: WebSocket, ev: Event) => any, // onOpen: (this: WebSocket, ev: Event) => any,
    this.connection.onopen = this.onOpen;
    // this.connection.onmessage = this.onMessage;
    this.connection.onclose = this.onClose;
  }

  send = (data: Message) => {
    this.connection.send(JSON.stringify(data));
  };

  newGame = () => {
    this.send({
      type: MessageType.NEW,
      payload: null,
    });

    return new Promise<Player>((res, rej) => {
      this.connection.onmessage = (message) => {
        console.log(message.data);
        try {
          const jwt = message.data;
          localStorage.setItem("jwt", jwt);
          const player = jsonwebtoken.decode(jwt) as Player;
          res(player);
        } catch (e) {
          rej(e);
        }
      };
    });
  };

  joinGame = (gameID: string, groupID = null) => {
    const jwt = localStorage.getItem("jwt");
    const options: JoinOptions = {
      gameID,
      groupID,
      jwt,
    };

    this.send({
      type: MessageType.JOIN,
      payload: options,
    });

    return new Promise<Player>((res, rej) => {
      this.connection.onmessage = (message) => {
        try {
          const jwt = message.data;
          localStorage.setItem("jwt", jwt);
          const player = jsonwebtoken.decode(jwt) as Player;
          res(player);
        } catch (e) {
          rej(e);
        }
      };
    });
  };
}
