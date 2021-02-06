import { FunctionComponent } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { useAuthStatePrimed } from "./firebaseHooks";
import Games from "./pages/games";
import Login from "./pages/login";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <AuthProtectedRoute path="/">
          <Games />
        </AuthProtectedRoute>
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
