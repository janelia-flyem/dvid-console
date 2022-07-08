import "./About.css";

export default function About() {
  return (
    <div className="aboutPage">
      <a href="https://github.com/janelia-flyem/dvid">
        <img
          className="dvidBanner"
          src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"
          alt="Fork me on GitHub"
        />
      </a>
      <h3>Welcome to DVID</h3>

      <p>
        DVID documentation can be found on{" "}
        <a href="https://github.com/janelia-flyem/dvid">github</a> as well as
        the automatically updated{" "}
        <a href="https://godoc.org/github.com/janelia-flyem/dvid">
          Go Doc documentation
        </a>
        .
      </p>

      <h4>HTTP API</h4>

      <p>
        Each data type within DVID exposes commands and an HTTP API allowing
        clients like this browser to retrieve and store data. Command-line and
        HTTP API documentation is currently distributed over a variety of data
        types. Visit the <a href="/api/help">/api/help HTTP endpoint</a> to
        review this server&apos;s current API.
      </p>

      <h3>Licensing</h3>
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
