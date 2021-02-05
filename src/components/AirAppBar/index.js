import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {AppBar, IconButton, Toolbar, Typography} from "@material-ui/core";
import {MenuOpenOutlined} from "@material-ui/icons";


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

export default function AirAppBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuOpenOutlined/>
          </IconButton>
          <Typography variant="h6" color="inherit">
            Photos
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
