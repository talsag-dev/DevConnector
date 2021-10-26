import "./App.css";
import React, { Fragment } from "react";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
import Register from "./components/auth/Register";
import { Login } from "./components/auth/Login";
import Alert from "./components/layout/Alert";
import { Provider } from "react-redux";
import store from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Route exact path='/' component={Landing} />
        <section className='container'>
          <Alert />
          <Switch>
            <Route exact path='/register' component={Register} />
            <Route exact path='/login' component={Login} />
          </Switch>
        </section>
        <Fragment />
      </Router>
    </Provider>
  );
};

export default App;