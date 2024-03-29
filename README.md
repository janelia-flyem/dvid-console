dvid-console [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/jfrc_grey_180x40.png)](http://www.janelia.org)
=============

Web console for [DVID](https://github.com/janelia-flyem/dvid), a distributed, versioned
image-oriented datastore.  The console allows administration of a DVID server without the need to install
additional tools.

This code can be used with DVID in two ways:
* Specify the repo location using the `-webclient` option with the DVID `serve`command.
* Compile the entire repository into gzipped data that is included in dvid executable.  This
allows a single DVID executable to have an embedded console and is the default way that DVID
is built.

Usage
==============

##### Quick Install
*When you want to use the latest release of the console without making any changes.*
* Make sure you have [DVID](https://github.com/janelia-flyem/dvid) installed and configured
* Download the dvid-console-&lt;version&gt;.tar.gz file from the [latest release] (https://github.com/janelia-flyem/dvid-console/releases/latest)
* Unpack it

  ```bash
    tar -zxvf dvid-console-<version>.tar.gz
  ```
* Make sure to set the `webClient` in `[server]` section of the TOML file when starting the DVID server:

  `dvid -verbose serve /path/to/config.toml`


##### For Developers
*When you want to use the bleeding edge or make your own modifications*
* Clone the repository
* Make sure you have [node and npm](https://nodejs.org/) installed.
* Install all the dependencies with npm

  ```bash
  cd /into/the/repository/clone
  npm install
  ```

* test the console

  ```bash
  npm run start
  ```

* build the console

  ```bash
  npm run build
  ```
* Make sure to set the `webClient` in `[server]` section of the TOML file when starting the DVID server


