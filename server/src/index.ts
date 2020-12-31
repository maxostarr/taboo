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

const newGame = (ws: WebSocket) => {
  const gameID = uuid();
  games[gameID] = {
    players: [],
    state: GameState.NEW,
  };
  const jwtPayload = jwt.sign(
    JSON.stringify({
      gameID,
      playerID: uuid(),
      groupID: uuid(),
    } as Player),
    jwtSecret,
  );

  ws.send(jwtPayload);
};

const joinGame = (ws: WebSocket, data: JoinOptions) => {
  let gameID;
  let groupID;
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
    const decoded = jwt.decode(data.jwt);
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
    groupID = data.groupID ? data.groupID : uuid();
  }
  const newPlayer: Player = {
    gameID,
    groupID,
    playerID: uuid(),
    websocket: ws,
  };
  games[gameID].players.push(newPlayer);
  ws.send(
    jwt.sign(
      JSON.stringify({
        playerID: newPlayer.playerID,
        gameID,
        groupID,
      } as Player),
      jwtSecret,
    ),
  );
};

app.ws("/ws", function (ws, req) {
  ws.on("message", function (msg) {
    const parsed = JSON.parse(msg.toString()) as Message;
    if (parsed.type === MessageType.NEW) {
      newGame(ws);
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
