import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@mui/material';
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    // Get users from model (Phase 1)
    const userList = window.models.userListModel();
    this.setState({ users: userList });
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
