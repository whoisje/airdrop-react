import AirAppBar from "@/components/AirAppBar";
import React from "react";
import AirBreadcrumb from "@/components/AirBreadcrumb";
import {Divider} from "@material-ui/core";
import AirDesign from "@/pages/AirDesign";


function BasicLayout(props) {
  return (
    <div>
      <AirAppBar/>
      <AirBreadcrumb/>
      <Divider/>
      <AirDesign/>
    </div>
  );
}

export default BasicLayout;
