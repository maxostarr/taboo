import { FunctionComponent } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useAuthStatePrimed } from "./utils/firebaseHooks";
import Game from "./pages/game";
import Games from "./pages/games";
import Login from "./pages/login";
import { UserContextProvider } from "./utils/userContext";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <UserContextProvider>
          <Switch>
            <AuthProtectedRoute path="/:id">
              <Game />
            </AuthProtectedRoute>
            <AuthProtectedRoute path="/">
              <Games />
            </AuthProtectedRoute>
          </Switch>
        </UserContextProvider>
      </Switch>
    </Router>
  );
}

interface AuthProtectedRouteProps {
  path: string;
}

const AuthProtectedRoute: FunctionComponent<AuthProtectedRouteProps> = ({
  children,
  ...rest
}) => {
  const [user, loading, error] = useAuthStatePrimed();
  if (loading) {
    return <p>loading</p>;
  }
  return (
    <Route
      {...rest}
      render={({ location }) =>
        user || error ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default App;
