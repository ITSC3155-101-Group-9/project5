import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom'; // ✅ YOU WERE MISSING THIS
import axios from 'axios'; // ✅ NEW
import './userList.css';

/**
 * Define UserList, a React component of project #6
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    // ❌ OLD:
    // const userList = window.models.userListModel();

    // ✅ NEW: Fetch from backend
    axios.get('/user/list')
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
      });
  }

  render() {
    return (
      <div className="user-list">
        <Typography variant="h6">Users</Typography>

        <List component="nav">
          {this.state.users.map((user) => (
            <div key={user._id}>
              <ListItem button component={Link} to={`/users/${user._id}`}>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
