import { Redirect } from "react-router-dom";
import { login, useAuthStatePrimed } from "../utils/firebaseHooks";
const Login = () => {
  const [user, loading, error] = useAuthStatePrimed();
  console.error(error);
  if (user) {
    return (
      <Redirect
        to={{
          pathname: "/",
          // state: { from: location },
        }}
      />
    );
  }
  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
