import AirAppBar from "@/components/AirAppBar";
import React from "react";
import AirBreadcrumb from "@/components/AirBreadcrumb";
import {Divider} from "@material-ui/core";
import AirFileTree from "@/components/AirFileTree";
import SplitPane from "react-split-pane";
import "./index.css"

function BasicLayout(props) {
  return (
    <div>
      <AirAppBar/>
      <AirBreadcrumb/>
      <Divider />
      <SplitPane split="vertical"
                 minSize={100}
                 defaultSize={200}>
        <AirFileTree/>
        <div />
        <div />
      </SplitPane>
    </div>
  );
}

export default BasicLayout;
