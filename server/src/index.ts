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

const sendError = (ws: WebSocket, payload: string) => {
  ws.send(
    JSON.stringify({
      type: MessageType.ERROR,
      payload,
    } as Message),
  );
};

const sendMessage = (ws: WebSocket, payload: Message) => {
  ws.send(JSON.stringify(payload));
};

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
      sendError(ws, "invalid jwt");
      return;
    }

    const decoded = jwt.decode(data.jwt) as Player;
    if (!decoded || typeof decoded === "string") {
      sendError(ws, "couldn't decode jwt");
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

  sendMessage(ws, {
    type: MessageType.NEW,
    payload: jwtPayload,
  } as Message);
};

const joinGroup = (ws: WebSocket, data: JoinGroupOptions) => {
  if (!data.jwt) {
    sendError(ws, "unknown user");
    return;
  }
  try {
    jwt.verify(data.jwt, jwtSecret);
  } catch (e) {
    sendError(ws, "invalid jwt");
    return;
  }
  const decoded = jwt.decode(data.jwt) as Player;
  if (!decoded || typeof decoded === "string") {
    sendError(ws, "couldn't decode jwt");
    return;
  }
  if (!decoded.gameID) {
    sendError(ws, "must include game ID");
    return;
  }
  const gameID = decoded.gameID;
  const fullPlayer: Player = {
    ...decoded,
    groupID: data.groupID ? data.groupID : uuid(),
    websocket: ws,
  };
  const playerIndex = games[gameID].players.findIndex(
    (p) => p.playerID === decoded.playerID,
  );
  games[gameID].players[playerIndex] = fullPlayer;
  games[gameID].players.forEach((player) => {
    console.log("sending to", player.playerID);

    sendMessage(player.websocket.send, {
      type: MessageType.UPDATE_PLAYER,
      payload: jwt.sign(
        {
          ...fullPlayer,
          websocket: undefined,
        } as Player,
        jwtSecret,
      ),
    });
  });
};

const joinGame = (ws: WebSocket, data: JoinGameOptions) => {
  let gameID: string;
  if (!data.jwt) {
    if (!data.gameID || !Object.keys(games).includes(data.gameID)) {
      sendError(ws, "must specify a valid game to join");
      return;
    }
    gameID = data.gameID;
  } else {
    try {
      jwt.verify(data.jwt, jwtSecret);
    } catch (e) {
      sendError(ws, "invalid jwt");
      return;
    }
    const decoded = jwt.decode(data.jwt) as Player;
    if (!decoded || typeof decoded === "string") {
      sendError(ws, "couldn't decode jwt");
      return;
    }
    gameID = data.gameID;
    if (!gameID || !Object.keys(games).includes(gameID)) {
      sendError(ws, "jwt unkown gameID");
      return;
    }
    if (games[gameID].players.find((p) => p.playerID === decoded.playerID)) {
      sendError(ws, "player already in game");
      return;
    }
  }
  const newPlayer: Player = {
    gameID,
    groupID: null,
    playerID: uuid(),
    websocket: ws,
  };

  games[gameID].players.forEach((player) => {
    sendMessage(player.websocket.send, {
      type: MessageType.ADD_PLAYER,
      payload: jwt.sign(
        {
          playerID: newPlayer.playerID,
          gameID,
          groupID: null,
        } as Player,
        jwtSecret,
      ),
    });
  });

  games[gameID].players.push(newPlayer);
  sendMessage(ws, {
    type: MessageType.PLAYERS_LIST,
    payload: JSON.stringify(
      games[gameID].players.map(
        (p) =>
          ({
            ...p,
            websocket: undefined,
          } as Player),
      ),
    ),
  } as Message);

  sendMessage(ws, {
    type: MessageType.JOIN_GAME,
    payload: jwt.sign(
      {
        playerID: newPlayer.playerID,
        gameID,
        groupID: null,
      } as Player,
      jwtSecret,
    ),
  });
};

app.ws("/ws", function (ws, req) {
  ws.on("message", function (msg) {
    const parsed = JSON.parse(msg.toString()) as Message;
    if (parsed.type === MessageType.NEW) {
      newGame(ws, parsed.payload);
    }
    if (parsed.type === MessageType.JOIN_GAME) {
      joinGame(ws, parsed.payload);
    }
    if (parsed.type === MessageType.JOIN_GROUP) {
      joinGroup(ws, parsed.payload);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
