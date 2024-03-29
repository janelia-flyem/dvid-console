import DVID from "dvid";

const api = new DVID({
  host: process.env.REACT_APP_HOSTNAME,
  port: process.env.REACT_APP_PORT,
  protocol: process.env.REACT_APP_PROTOCOL,
  username: process.env.REACT_APP_USERNAME || "dvidconsole",
  application: process.env.REACT_APP_APPLICATION || "dvidconsole",
});

/*
  const api = new DVID({
  host: "http://localhost",
  port: "9000",
  username: "dvidconsole",
  application: "dvidconsole",
});
*/

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

export function repoInfo(options) {
	return api.repo(options);
}

export function createRepo(options) {
  return api.createRepo(options);
}

export function masterUUID(rootUUID) {
  return api.repo({uuid: rootUUID, endpoint: 'branch-versions/master'});
}

export function getDefaultInstances(uuid) {
  return api.node({uuid, endpoint: 'default_instances/key/data'});
}

