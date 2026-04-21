
import React from "react";
import axios from "axios";
import {
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import "./loginRegister.css";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login_name: "",
      login_password: "",

      register_login_name: "",
      register_password: "",
      register_password_confirm: "",
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: "",

      errorMessage: "",
      successMessage: "",
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errorMessage: "",
      successMessage: "",
    });
  };

  handleLogin = async () => {
    const { login_name, login_password } = this.state;

    if (!login_name.trim() || !login_password.trim()) {
      this.setState({ errorMessage: "Please enter login name and password." });
      return;
    }

    try {
      const response = await axios.post("/admin/login", {
        login_name: login_name.trim(),
        password: login_password,
      });

      this.setState({
        errorMessage: "",
        successMessage: "Login successful.",
        login_password: "",
      });

      if (this.props.handleLogin) {
        this.props.handleLogin(response.data);
      }

      if (this.props.history) {
        this.props.history.push(`/users/${response.data._id}`);
      }
    } catch (err) {
      this.setState({
        errorMessage:
          (err.response && err.response.data) || "Login failed.",
        successMessage: "",
      });
    }
  };

  handleRegister = async () => {
    const {
      register_login_name,
      register_password,
      register_password_confirm,
      first_name,
      last_name,
      location,
      description,
      occupation,
    } = this.state;

    if (register_password !== register_password_confirm) {
      this.setState({
        errorMessage: "Passwords do not match.",
        successMessage: "",
      });
      return;
    }

    try {
      await axios.post("/user", {
        login_name: register_login_name.trim(),
        password: register_password,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        location: location.trim(),
        description: description.trim(),
        occupation: occupation.trim(),
      });

      this.setState({
        register_login_name: "",
        register_password: "",
        register_password_confirm: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
        errorMessage: "",
        successMessage: "Registration successful. You can now log in.",
      });
    } catch (err) {
      this.setState({
        errorMessage:
          (err.response && err.response.data) || "Registration failed.",
        successMessage: "",
      });
    }
  };

  render() {
    return (
      <Box className="login-register-container">
        <Typography variant="h4" gutterBottom>
          Please Login
        </Typography>

        {this.state.errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {this.state.errorMessage}
          </Alert>
        ) : null}

        {this.state.successMessage ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {this.state.successMessage}
          </Alert>
        ) : null}

        <Box className="login-section">
          <Typography variant="h6" gutterBottom>
            Login
          </Typography>

          <TextField
            label="Login Name"
            name="login_name"
            value={this.state.login_name}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            name="login_password"
            type="password"
            value={this.state.login_password}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <Button
            variant="contained"
            onClick={this.handleLogin}
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box className="register-section">
          <Typography variant="h6" gutterBottom>
            Register
          </Typography>

          <TextField
            label="Login Name"
            name="register_login_name"
            value={this.state.register_login_name}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            name="register_password"
            type="password"
            value={this.state.register_password}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Confirm Password"
            name="register_password_confirm"
            type="password"
            value={this.state.register_password_confirm}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="First Name"
            name="first_name"
            value={this.state.first_name}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Last Name"
            name="last_name"
            value={this.state.last_name}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Location"
            name="location"
            value={this.state.location}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Description"
            name="description"
            value={this.state.description}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <TextField
            label="Occupation"
            name="occupation"
            value={this.state.occupation}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={this.handleRegister}
            sx={{ mt: 2 }}
          >
            Register Me
          </Button>
        </Box>
      </Box>
    );
  }
}

export default LoginRegister;
