import React, { Component } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import fetchModel from "../../lib/fetchModelData";
import "./TopBar.css";

class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schemaVersion: null,
      uploadError: "",
      uploading: false,
    };

    this.uploadInput = React.createRef();
  }

  componentDidMount() {
    this.loadSchemaInfo();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.currentUser && this.props.currentUser) {
      this.loadSchemaInfo();
    }

    if (prevProps.currentUser && !this.props.currentUser) {
      this.setState({
        uploadError: "",
        uploading: false,
      });
    }
  }

  loadSchemaInfo() {
    fetchModel("/test/info")
      .then((result) => {
        if (result && result.data && typeof result.data.__v !== "undefined") {
          this.setState({ schemaVersion: result.data.__v });
        }
      })
      .catch(() => {
        this.setState({ schemaVersion: null });
      });
  }

  handleAddPhotoClick = () => {
    if (this.uploadInput.current) {
      this.uploadInput.current.click();
    }
  };

  handleFileSelected = async (event) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    this.setState({
      uploadError: "",
      uploading: true,
    });

    try {
      await this.props.onPhotoUpload(file);
      event.target.value = "";
      this.setState({
        uploading: false,
      });
    } catch (err) {
      event.target.value = "";
      this.setState({
        uploading: false,
        uploadError:
          (err.response && err.response.data) ||
          err.message ||
          "Photo upload failed.",
      });
    }
  };

  renderAuthSection() {
    const { currentUser, onLogout, uploadMessage } = this.props;
    const { uploadError, uploading } = this.state;

    if (!currentUser) {
      return (
        <Typography variant="h6" className="topbar-auth-text">
          Please Login
        </Typography>
      );
    }

    return (
      <Box className="topbar-actions">
        <Typography variant="h6" className="topbar-auth-text">
          Hi {currentUser.first_name}
        </Typography>

        <input
          type="file"
          accept="image/*"
          ref={this.uploadInput}
          style={{ display: "none" }}
          onChange={this.handleFileSelected}
        />

        <Button
          color="inherit"
          variant="outlined"
          size="small"
          className="topbar-button"
          onClick={this.handleAddPhotoClick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add Photo"}
        </Button>

        <Button
          color="inherit"
          variant="outlined"
          size="small"
          className="topbar-button"
          onClick={onLogout}
        >
          Logout
        </Button>

        {uploadError ? (
          <Typography variant="body2" className="topbar-error">
            {uploadError}
          </Typography>
        ) : null}

        {uploadMessage ? (
          <Typography variant="body2" className="topbar-success">
            {uploadMessage}
          </Typography>
        ) : null}
        
      </Box>
    );
  }

  render() {
    const { main_content } = this.props;
    const { schemaVersion } = this.state;

    return (
      <AppBar position="absolute" className="topbar-appBar">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h5" className="topbar-name">
            Photo Share
          </Typography>

          <Typography variant="h6" className="topbar-context">
            {main_content || ""}
          </Typography>

          {schemaVersion !== null ? (
            <Typography variant="body1" className="topbar-version">
              v{schemaVersion}
            </Typography>
          ) : null}

          {this.renderAuthSection()}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
