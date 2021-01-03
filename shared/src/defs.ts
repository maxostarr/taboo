export enum MessageType {
  NEW,
  JOIN_GAME,
  JOIN_GROUP,
  ADD_PLAYER,
  UPDATE_PLAYER,
  UPDATE_GAME,
  PLAYERS_LIST,
  ERROR,
}

export enum GameState {
  NEW,
  READY,
  PLAYING,
  PASSING,
  STOPPED,
}

export enum ConnectionState {
  CONNECTING,
  OPEN,
  CLOSED,
}
