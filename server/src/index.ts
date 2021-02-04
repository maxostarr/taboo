import express from "express";
import WebSocket from "ws";
import expressWs from "express-ws";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { MessageType, GameState } from "../../shared/src/defs";

const { app } = expressWs(express());
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

interface Groups {
  [key: string]: Player[];
}

const checkGameReady = (gameID: string) => {
  const game = games[gameID];
  const groups = game.players.reduce((prev: Groups, player) => {
    if (!player.groupID) {
      if (!prev.waiting) {
        prev.waiting = [];
      }
      return {
        ...prev,
        waiting: [...prev.waiting, player],
      } as Groups;
    }
    const groupID = player.groupID;
    if (!prev[groupID]) {
      prev[groupID] = [];
    }
    return {
      ...prev,
      [groupID]: [...prev[groupID], player],
    };
  }, {});
  console.log(groups);

  if (groups.waiting && groups.waiting.length > 0) return false;
  console.log("no waiting");

  if (Object.keys(groups).length < 2) return false;
  console.log("enough groups");
  for (const id in groups) {
    if (id === "waiting") continue;
    if (groups[id].length !== 2) return false;
    console.log(`group ${id} is full`);
  }
  console.log("game ready");

  return true;
};

const newGame = (ws: WebSocket, data: NewGameOptions) => {
  const gameID = uuid();
  games[gameID] = {
    players: [],
    state: GameState.NEW,
    _id: gameID,
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

    playerID = decoded._id;
  }

  const newPlayer: Player = {
    gameID,
    _id: playerID ? playerID : uuid(),
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
    (p) => p._id === decoded._id,
  );
  games[gameID].players[playerIndex] = fullPlayer;
  games[gameID].players.forEach((player) => {
    console.log("sending to", player._id);

    sendMessage(player.websocket, {
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

  if (checkGameReady(gameID)) {
    games[gameID].state = GameState.READY;
  } else {
    games[gameID].state = GameState.NEW;
  }
  games[gameID].players.forEach((p) => {
    sendMessage(p.websocket, {
      type: MessageType.UPDATE_GAME,
      payload: {
        state: games[gameID].state,
      } as Game,
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
    if (games[gameID].players.find((p) => p._id === decoded._id)) {
      sendError(ws, "player already in game");
      return;
    }
  }
  const newPlayer: Player = {
    gameID,
    groupID: null,
    _id: uuid(),
    websocket: ws,
  };

  games[gameID].players.forEach((player) => {
    sendMessage(player.websocket, {
      type: MessageType.ADD_PLAYER,
      payload: jwt.sign(
        {
          _id: newPlayer._id,
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
        _id: newPlayer._id,
        gameID,
        groupID: null,
      } as Player,
      jwtSecret,
    ),
  });

  if (checkGameReady(gameID)) {
    games[gameID].players.forEach((p) => {
      sendMessage(p.websocket, {
        type: MessageType.UPDATE_GAME,
        payload: {
          ...games[gameID],
          state: GameState.READY,
        } as Game,
      });
    });
  }
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
