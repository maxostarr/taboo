export enum MessageType {
  NEW,
  JOIN_GAME,
  JOIN_GROUP,
  ADD_PLAYER,
  UPDATE_PLAYER,
  PLAYERS_LIST,
  ERROR,
}

export enum GameState {
  NEW,
  PLAYING,
  PASSING,
  STOPPED,
}

export enum ConnectionState {
  CONNECTING,
  OPEN,
  CLOSED,
}
