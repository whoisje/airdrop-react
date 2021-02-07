import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Card, CardContent, CardHeader, IconButton, Tab, Tabs} from "@material-ui/core";
import {Remove} from "@material-ui/icons";
import {SIDE_BAR_WIDTH} from "@/constants/global";

function TabPanel(props) {
  const {children, value, index, hidden, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index || hidden}
      style={{minWidth: SIDE_BAR_WIDTH, height: "100%"}}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      <div
        style={{height: "100%"}}
        hidden={value !== index}>
        {children}
      </div>
    </div>
  );
}


function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: "100%"
  },
  tabs: {
    height: "100%",
    width: SIDE_BAR_WIDTH,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  head: {
    padding: theme.spacing(1),
    paddingBottom: 0,
  },
  content: {
    padding: 0,
    height: "100%"
  }
}));

export default function VerticalTabs(props) {
  const {labels, paneContents, onChange} = props
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [expand, setExpand] = useState(true)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleExpand = () => {
    if (onChange) {
      onChange(true)
    }
    setExpand(true)
  }
  const handleHide = () => {
    if (onChange) {
      onChange(false)
    }
    setExpand(false)
  }
  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onClick={handleExpand}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >{
        labels.map((label, index) =>
          <Tab
            key={index}
            style={{minWidth: SIDE_BAR_WIDTH}}
            label={label}
            {...a11yProps(index)} />)
      }
      </Tabs>
      {
        paneContents.map((ele, index) =>
          <TabPanel
            hidden={!expand}
            style={{width: "100%", height: "100%"}}
            key={index}
            value={value}
            index={index}>
            <Card style={{height: "100%"}}>
              <CardHeader
                className={classes.head}
                action={
                  <IconButton
                    variant="outlined"
                    size="small"
                    onClick={handleHide}
                  >
                    <Remove/>
                  </IconButton>

                }
                subheader={labels[index]}
              />
              <CardContent className={classes.content}>
                {ele}
              </CardContent>
            </Card>
          </TabPanel>
        )
      }
    </div>
  );
}
