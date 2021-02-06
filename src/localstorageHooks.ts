import { useState } from "react";

export const useStoredUsername = () => {
  const loadedUsername = localStorage.getItem("username");
  const [username, setUsername] = useState(loadedUsername);
  const updateUsername = (newUsername: string) => {
    localStorage.setItem("username", newUsername);
    setUsername(newUsername);
  };
  return [username, updateUsername];
};
