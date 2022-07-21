import DVID from "dvid";

const api = new DVID({
  host: "emdata5.janelia.org",
  port: "443",
  protocol: "https",
  username: "dvidconsole",
  application: "dvidconsole",
});

export function getRepos() {
  return api.reposInfo();
}

export function serverInfo() {
  return api.serverInfo();
}

export function serverTypes() {
  return api.serverTypes();
}

export function serverCompiledTypes() {
  return api.serverCompiledTypes();
}

export function serverLoad() {
  return api.load();
}
