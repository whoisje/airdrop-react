import React from 'react';
import Popover from '@material-ui/core/Popover';
import {makeStyles} from '@material-ui/core/styles';
import css from "./index.css"

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
}));
const stepAttrs = {
  name: '步骤名称',
  statusDesc: '运行状态',
  startTime: '开始时间',
  inCount: "输入行数",
  outCount: "输出行数",
  inSpeed: "输入速度(行/秒)",
  outSpeed: "输出速度(行/秒)",
  errorCount: "错误行数",
  endTime: '结束时间',
}

export default function StepPopover(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {stepInfo, children} = props
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <div
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onClick={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {children}
      </div>
      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {Object.entries(stepAttrs).map(([key, text]) => {
          const value = stepInfo[key]
          if (value) {
            return (
              <li key={key} className={css.item}>
                <span className={css.label}>{text}</span>
                <span className={css.text}>{value}</span>
              </li>
            )
          }
          return null
        })}
      </Popover>
    </div>
  );
}
