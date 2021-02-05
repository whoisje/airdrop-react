import {Breadcrumbs, Link, makeStyles, Typography} from "@material-ui/core";
import {FileCopyOutlined, Folder, Home} from "@material-ui/icons";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    padding:theme.spacing(0.5)
  },
  link: {
    display: 'flex',
  },
  icon: {
    marginRight: theme.spacing(0.5),
    width: 20,
    height: 20,
  },
}));

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export default function AirBreadcrumb() {
  const classes = useStyles();

  return (
    <Breadcrumbs aria-label="breadcrumb" className={classes.root}>
      <Link color="inherit" href="/" onClick={handleClick} className={classes.link}>
        <Home className={classes.icon}/>
        Material-UI
      </Link>
      <Link
        color="inherit"
        href="/getting-started/installation/"
        onClick={handleClick}
        className={classes.link}
      >
        <Folder className={classes.icon}/>
        Core
      </Link>
      <Typography color="textPrimary" className={classes.link}>
        <FileCopyOutlined className={classes.icon}/>
        Breadcrumb
      </Typography>
    </Breadcrumbs>
  );
}
