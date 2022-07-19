import dvid from "dvid";

const api = dvid.connect({
  host: "emdata.janelia.org",
  port: "443",
  protocol: "https",
  username: "dvidconsole",
  application: "dvidconsole",
});

export function getRepos() {
  return new Promise((resolve, reject) => {
    api.reposInfo({
      callback: (data) => {
        resolve(data);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
