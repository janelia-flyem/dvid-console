dvid-console [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/jfrc_grey_180x40.png)](http://www.janelia.org)
=============

Web console for [DVID](https://github.com/janelia-flyem/dvid), a distributed, versioned
image-oriented datastore.  The console allows administration of a DVID server as well
as an automated API help system using [RAML](http://www.raml.org).  

This code can be used with DVID in two ways:
* Specify the repo location using the `-webclient=/path/to/repo` option with the DVID `serve`
command.
* Compile the entire repository into gzipped data that is included in dvid executable.  This
allows a single DVID executable to have an embedded console and is the default way that DVID
is built.