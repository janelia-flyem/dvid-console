import Typography from "@mui/material/Typography";
import "./About.css";

export default function About() {
  return (
    <div className="aboutPage">
      <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
        Welcome to DVID
      </Typography>

      <p>
        DVID documentation can be found on{" "}
        <a href="https://github.com/janelia-flyem/dvid">github</a> as well as
        the automatically updated{" "}
        <a href="https://godoc.org/github.com/janelia-flyem/dvid">
          Go Doc documentation
        </a>
        .
      </p>

      <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
      HTTP API
      </Typography>

      <p>
        Each data type within DVID exposes commands and an HTTP API allowing
        clients like this browser to retrieve and store data. Command-line and
        HTTP API documentation is currently distributed over a variety of data
        types. Visit the <a href="/api/help">/api/help HTTP endpoint</a> to
        review this server&apos;s current API.
      </p>

      <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
      Licensing
      </Typography>
      <p>
        DVID is released under the{" "}
        <a href="https://www.janelia.org/open-science/software-licensing">
          Janelia license
        </a>
        , a
        <a href="http://en.wikipedia.org/wiki/BSD_license#3-clause_license_.28.22New_BSD_License.22_or_.22Modified_BSD_License.22.29">
          {" "}
          3-clause BSD license
        </a>
        .
      </p>
    </div>
  );
}
