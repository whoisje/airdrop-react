import {makeStyles} from "@material-ui/core";
import {TreeItem, TreeView} from "@material-ui/lab";
import React from "react";
import {Folder, FolderOpen, InsertDriveFile} from "@material-ui/icons";

const data = {
  id: 'root',
  name: 'Parent',
  children: [
    {
      id: '1',
      name: 'Child - 1',
    },
    {
      id: '3',
      name: 'Child - 3',
      children: [
        {
          id: '4',
          name: 'Child - 4',
        },
      ],
    },
  ],
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: 800,
    flexGrow: 1,
    padding: theme.spacing(1)
  },
}));

export default function AirFileTree() {
  const classes = useStyles();

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<FolderOpen color="primary"/>}
      defaultExpanded={['root']}
      defaultExpandIcon={<Folder color="primary"/>}
      defaultEndIcon={<InsertDriveFile color="action"/>}
    >
      {renderTree(data)}
    </TreeView>
  );
}
