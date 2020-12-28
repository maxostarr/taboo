import express from "express";
import expressWs from "express-ws";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
const { app, getWss, applyTo } = expressWs(express());
const port = process.env.PORT ? (+process.env.PORT as number) : 3000;

const jwtSecret = "dsflkghaskifgjAWHIH";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/newgame", (req, res) => {
  const jwtPayload = jwt.sign(
    JSON.stringify({
      gameID: uuid(),
      userID: uuid(),
      groupID: uuid(),
    }),
    jwtSecret,
  );
  res.json(jwtPayload);
});

app.ws("/ws", function (ws, req) {
  ws.on("message", function (msg) {
    console.log(msg);
  });
  console.log("socket", req.ip);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
