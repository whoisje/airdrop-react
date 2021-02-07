import AirAppBar from "@/components/AirAppBar";
import React from "react";
import AirBreadcrumb from "@/components/AirBreadcrumb";
import {Container, Divider} from "@material-ui/core";
import AirDesign from "@/pages/AirDesign";


function BasicLayout(props) {
  return (
    <div>
      <AirAppBar/>
      <AirBreadcrumb/>
      <Divider/>
      <Container>
        <AirDesign/>
      </Container>
    </div>
  );
}

export default BasicLayout;
