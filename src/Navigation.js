import { Outlet, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import "./Navigation.css";

export default function Navigation({ children }) {
  return (
    <>
      <AppBar position="sticky" color="warning" sx={{ bgcolor: "#333" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" className="navLink">
              DVID
            </Link>
          </Typography>
          <Link to="/admin" className="navLink">
            <FontAwesomeIcon icon={faGear} size="xl" />
          </Link>
          <Link to="/about" className="navLink">
            <FontAwesomeIcon icon={faCircleInfo} size="xl" />
          </Link>
          <a href="https://github.com/janelia-flyem/dvid" className="navLink">
            <FontAwesomeIcon icon={faGithub} size="xl" />
          </a>
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
}
