import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import {
  HashRouter,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import {
  Grid,
  Paper,
} from "@mui/material";
import "./styles/main.css";

// Components
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/userDetail";
import UserList from "./components/userList/userList";
import UserPhotos from "./components/userPhotos/userPhotos";
import LoginRegister from "./components/loginRegister/loginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      mainContent: "",
      photoUploadMessage: "",
      photoRefreshKey: 0,
    };
  }

  handleLogin = (user) => {
    this.setState({
      currentUser: user,
      mainContent: "",
      photoUploadMessage: "",
    });
  };

  handleLogout = async () => {
    try {
      await axios.post("/admin/logout", {});
    } catch (err) {
      // Ignore backend logout error and still clear frontend state
      // so the user can get back to login screen cleanly.
    }

    this.setState({
      currentUser: null,
      mainContent: "",
      photoUploadMessage: "",
    });

    window.location.hash = "#/login-register";
  };

  changeMainContent = (text) => {
    this.setState({
      mainContent: text || "",
    });
  };

  handlePhotoUpload = async (file) => {
    if (!file) {
      throw new Error("Please choose a photo first.");
    }

    const domForm = new FormData();
    domForm.append("uploadedphoto", file);

    await axios.post("/photos/new", domForm);

    this.setState(prev => ({
      photoUploadMessage: "Photo uploaded successfully.",
      photoRefreshKey: prev.photoRefreshKey + 1,
    }));

    if (this.state.currentUser && this.state.currentUser._id) {
      window.location.hash = `#/photos/${this.state.currentUser._id}`;
    }
  };

  renderProtectedRoute = (renderFn) => {
    const { currentUser } = this.state;

    if (!currentUser) {
      return <Redirect to="/login-register" />;
    }

    return renderFn();
  };

  render() {
    const { currentUser, mainContent } = this.state;

    return (
      <HashRouter>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              currentUser={currentUser}
              main_content={mainContent}
              onLogout={this.handleLogout}
              onPhotoUpload={this.handlePhotoUpload}
              uploadMessage={this.state.photoUploadMessage}
            />
          </Grid>

          <div className="main-topbar-buffer" />

          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {currentUser ? <UserList /> : null}
            </Paper>
          </Grid>

          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Switch>
                <Route
                  exact
                  path="/login-register"
                  render={(props) => (
                    currentUser ? (
                      <Redirect to={`/users/${currentUser._id}`} />
                    ) : (
                      <LoginRegister
                        {...props}
                        handleLogin={this.handleLogin}
                      />
                    )
                  )}
                />

                <Route
                  exact
                  path="/users/:userId"
                  render={(props) => this.renderProtectedRoute(() => (
                    <UserDetail
                      {...props}
                      changeMainContent={this.changeMainContent}
                    />
                  ))}
                />

                <Route
                  exact
                  path="/photos/:userId"
                  render={(props) => this.renderProtectedRoute(() => (
                    <UserPhotos
                      key={this.state.photoRefreshKey}
                      {...props}
                      setTopBarContext={this.changeMainContent}
                    />
                  ))}
                />

                <Route
                  exact
                  path="/users"
                  render={() => (
                    currentUser ? (
                      <Redirect to={`/users/${currentUser._id}`} />
                    ) : (
                      <Redirect to="/login-register" />
                    )
                  )}
                />

                <Route
                  path="/"
                  render={() => (
                    currentUser ? (
                      <Redirect to={`/users/${currentUser._id}`} />
                    ) : (
                      <Redirect to="/login-register" />
                    )
                  )}
                />
              </Switch>
            </Paper>
          </Grid>
        </Grid>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById("photoshareapp")
);
