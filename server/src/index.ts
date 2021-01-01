import express from "express";
import WebSocket from "ws";
import expressWs from "express-ws";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { MessageType, GameState } from "../../shared/src/defs";
const { app, getWss, applyTo } = expressWs(express());
const port = process.env.PORT ? (+process.env.PORT as number) : 3000;

const jwtSecret = "dsflkghaskifgjAWHIH";

let games: {
  [gameID: string]: Game;
} = {};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const newGame = (ws: WebSocket, data: NewGameOptions) => {
  const gameID = uuid();
  games[gameID] = {
    players: [],
    state: GameState.NEW,
  };

  let playerID: string | null = null;
  if (data && data.jwt) {
    try {
      jwt.verify(data.jwt, jwtSecret);
    } catch (e) {
      ws.send("invalid jwt");
      return;
    }

    const decoded = jwt.decode(data.jwt) as Player;
    if (!decoded || typeof decoded === "string") {
      ws.send("couldn't decode jwt");
      return;
    }

    playerID = decoded.playerID;
  }

  const newPlayer: Player = {
    gameID,
    playerID: playerID ? playerID : uuid(),
    groupID: uuid(),
    websocket: ws,
  };
  games[gameID].players.push(newPlayer);
  const jwtPayload = jwt.sign(
    JSON.stringify({ ...newPlayer, websocket: undefined }),
    jwtSecret,
  );

  ws.send(
    JSON.stringify({
      type: MessageType.NEW,
      payload: jwtPayload,
    }),
  );
};

const joinGame = (ws: WebSocket, data: JoinOptions) => {
  let gameID: string;
  let groupID: string;
  if (!data.jwt) {
    if (!data.gameID || !Object.keys(games).includes(data.gameID)) {
      ws.send("must specify a valid game to join");
      return;
    }
    gameID = data.gameID;
    groupID = data.groupID ? data.groupID : uuid();
  } else {
    try {
      jwt.verify(data.jwt, jwtSecret);
    } catch (e) {
      ws.send("invalid jwt");
      return;
    }
    const decoded = jwt.decode(data.jwt) as Player;
    if (!decoded || typeof decoded === "string") {
      ws.send("couldn't decode jwt");
      return;
    }
    if (!decoded.gameID) {
      ws.send("jwt must include gameID");
      return;
    }
    gameID = decoded.gameID;
    if (!gameID || !Object.keys(games).includes(gameID)) {
      ws.send("jwt unkown gameID");
      return;
    }
    console.log(decoded.playerID);

    if (games[gameID].players.find((p) => p.playerID === decoded.playerID)) {
      ws.send("player already in game");
      return;
    }
    groupID = data.groupID ? data.groupID : uuid();
  }
  const newPlayer: Player = {
    gameID,
    groupID,
    playerID: uuid(),
    websocket: ws,
  };
  console.log(games);

  games[gameID].players.forEach((player) => {
    console.log("sending to", player.playerID);

    player.websocket.send(
      JSON.stringify({
        type: MessageType.ADD_PLAYER,
        payload: jwt.sign(
          JSON.stringify({
            playerID: newPlayer.playerID,
            gameID,
            groupID,
          } as Player),
          jwtSecret,
        ),
      }),
    );
  });

  games[gameID].players.push(newPlayer);
  ws.send(
    JSON.stringify({
      type: MessageType.PLAYERS_LIST,
      payload: JSON.stringify(
        games[gameID].players.map(
          (p) =>
            ({
              gameID: p.gameID,
              groupID: p.groupID,
              playerID: p.playerID,
            } as Player),
        ),
      ),
    } as Message),
  );

  ws.send(
    JSON.stringify({
      type: MessageType.JOIN,
      payload: jwt.sign(
        JSON.stringify({
          playerID: newPlayer.playerID,
          gameID,
          groupID,
        } as Player),
        jwtSecret,
      ),
    }),
  );
};

app.ws("/ws", function (ws, req) {
  ws.on("message", function (msg) {
    const parsed = JSON.parse(msg.toString()) as Message;
    if (parsed.type === MessageType.NEW) {
      newGame(ws, parsed.payload);
    }
    if (parsed.type === MessageType.JOIN) {
      joinGame(ws, parsed.payload);
    }
  });
  console.log("socket", req.ip);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
