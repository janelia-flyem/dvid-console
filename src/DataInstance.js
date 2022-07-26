import Tooltip from "@mui/material/Tooltip";
import "./DataInstance.css";

export default function DataInstance({
  instance,
  uuid,
  isParent,
  onImageSelect,
  onLabelSelect,
}) {
  let image_input = "";
  let label_input = "";
  const type = instance.Base.TypeName;
  const label_class = `label lbl-${type}`;
  let name = instance.Base.Name;
  let name_url = `/api/node/${uuid}/${name}/`;
  let info = "information";
  let masterMarker = "";
  if (isParent) {
    name = name + "*";
  }

  if (type === "keyvalue") {
    name_url += "keys/0/z";
    info = "keys";
  } else if (type === "labels64") {
    name_url += "metadata";
    info = "metadata";
  } else if (type === "roi") {
    name_url += "roi";
    info = "ROI coords";
  } else {
    name_url += "info";
  }

  const name_tooltip = `Display ${info}`;
  const type_url = `/api/node/${uuid}/${name}/help`;
  const type_tooltip = `Display ${type} help`;

  if (
    type === "grayscale8" ||
    type === "multiscale2d" ||
    type === "uint8blk" ||
    type === "imageimage" ||
    type === "googlevoxels"
  )
    image_input = <input type="radio" name="image_source" value={name} onChange={onImageSelect}></input>;
  else if (
    type === "labels64" ||
    type === "labelblk" ||
    type === "googlevoxels" ||
    type === "labelarray"
  )
    label_input = <input type="radio" name="label_source" value={name} onChange={onLabelSelect}></input>;

  return (
    <tr>
      <td>
        {masterMarker}
        <Tooltip title={name_tooltip} arrow placement="right">
          <a
            href={name_url}
            rel="noreferrer"
            target="_blank"
            data-toggle="tooltip"
            data-placement="right"
          >
            {name}
          </a>
        </Tooltip>
      </td>
      <td className="instanceType">
        <Tooltip title={type_tooltip} arrow placement="right">
          <a
            href={type_url}
            rel="noreferrer"
            target="_blank"
            data-toggle="tooltip"
            data-placement="right"
          >
            <span className={label_class}>{type}</span>
          </a>
        </Tooltip>
      </td>
      <td className="imgSource">{image_input}</td>
      <td className="labelSource">{label_input}</td>
    </tr>
  );
}
