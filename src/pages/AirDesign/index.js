import AirFileTree from "@/components/AirFileTree";
import SplitPane from "react-split-pane";
import React from "react";
import {makeStyles} from "@material-ui/core";
import VerticalTabs from "@/components/VerticalTab";
import AirTaskCanvas from "@/pages/AirTaskCanvas";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    flexGrow: 1,
  },
  drawer: {
    position: "none"
  },

}));
export default function AirDesign() {
  const [allow, setAllow] = React.useState(true);
  const [size, setSize] = React.useState(300);
  const classes = useStyles()
  const handleChange = (expand) => {
    setAllow(expand)
    if (!expand) {
      setSize(30)
    } else {
      setSize(300)
    }
  }
  return (
    <SplitPane split="vertical"
               allowResize={allow}
               minSize={60}
               size={size}
               defaultSize={200}>
      <VerticalTabs
        labels={["任务", "组件列表"]}
        onChange={handleChange}
        paneContents={[<AirFileTree/>, <></>]}
      />
      <AirTaskCanvas/>
    </SplitPane>
  )
}
