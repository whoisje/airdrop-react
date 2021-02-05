import styles from './index.css';
import AirAppBar from "@/components/AirAppBar";
import React from "react";

function BasicLayout(props) {
  return (
    <div className={styles.normal}>
      <AirAppBar/>
    </div>
  );
}

export default BasicLayout;
