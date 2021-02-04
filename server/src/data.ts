import Datastore from "nedb-promises";

const games = Datastore.create({
  filename: "../data/games.json",
  autoload: true,
});

const players = Datastore.create({
  filename: "../data/players.json",
  autoload: true,
});

export const createNewGame = (game: Game) => {
  games.insert(game);
};

export const createNewPlayer = (player: Player) => {
  players.insert(player);
};

export const findGameByID = async (gameID: GameID) => {
  return await games.findOne({
    _id: gameID,
  });
};

export const addPlayerToGameByID = async (
  gameID: GameID,
  playerID: PlayerID,
) => {
  return await games.update(
    {
      _id: gameID,
    },
    {
      $addToSet: {
        players: playerID,
      },
    },
  );
};

export const updatePlayerGroupByID = async (
  playerID: string,
  groupID: string,
) => {
  return await players.update(
    {
      _id: playerID,
    },
    {
      groupID,
    },
  );
};

const getAllGroupsFromGameByID = async (gameID: GameID) => {
  const gamePlayers = await players.find({
    gameID,
  });

  gamePlayers.reduce(
    (prev, player: Document & Player) => {
      if (!player.groupID) {
        return {
          ...prev,
          waiting: [...prev.waiting, player],
        };
      }
      return {
        ...prev,
        [player.groupID]: [...prev[player.groupID], player],
      };
    },
    {} as {
      [key: string]: Player[];
    },
  );
};
