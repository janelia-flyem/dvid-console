import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import { format, formatDistance } from "date-fns";

import "./RepoLog.css";

export default function RepoLog({ log, uuid }) {

	let logDuration = '0 days';

	if (log.length > 0) {
	  logDuration = formatDistance(new Date(log[0].split(/\s(.+)/)[0]), new Date(log[log.length -1].split(/\s(.+)/)[0]));
	}


  return (
    <Grid item xs={12}>
      <Card className="repoLog">
        <CardHeader
          title="Repo Log:"
          titleTypographyProps={{ variant: "p" }}
          sx={{ background: "#eee" }}
        action={<><span>{log.length} entries covering {logDuration} </span></>}
        />
        <CardContent>
          <table>
            <tbody>
              {log
                .slice()
                .reverse()
                .map((entry, i) => {
                  const [date, description] = entry.split(/\s(.+)/);
                  return (
                    <tr key={`${date}:${i}`} className={i % 2 ? "even" : "odd"}>
                      <td style={{ width: "14em" }}>
                        {" "}
                        {format(new Date(date), "MMM do yyyy, h:mm:ss a")}
                      </td>
                      <td>{description}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </Grid>
  );
}
