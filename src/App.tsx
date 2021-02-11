import React, { FunctionComponent } from "react";
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
import { UserContextProvider } from "./utils/userContext";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <UserContextProvider>
          <AuthProtectedRoute path="/">
            <Games />
          </AuthProtectedRoute>
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
