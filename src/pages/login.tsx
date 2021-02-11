import { Redirect } from "react-router-dom";
import { login, useAuthStatePrimed } from "../firebaseHooks";
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
  return (
    <div>
      <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
