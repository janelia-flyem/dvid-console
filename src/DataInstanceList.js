import { useQuery } from "react-query";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import { getDefaultInstances } from "./lib/dvid";
import DataInstance from "./DataInstance";
import "./DataInstanceList.css";

function dataInstancesForNode(instances, chosenNode, dagNodes, nodeRestrict) {
  /* var instances = ServerStore.repo.DataInstances;
   * var chosen_node = ServerStore.uuid;
   * var dagNodes = ServerStore.repo.DAG.Nodes;
   */

  // create a lookup and reverse lookup for all of the nodes so we can get parents.
  var byUUIDLookUp = {};
  var byIdLookUp = {};
  var sorted = [];
  var parents = {};

  for (var key in dagNodes) {
    byUUIDLookUp[key] = dagNodes[key].Parents;
    byIdLookUp[dagNodes[key].VersionID] = key;
  }

  // generate an ancestors list to be used for exclusion.
  var ancestors = {};
  // work back from the chosen node and add all the ancestors to one list.
  function add_ancestors(node) {
    if (node && node.UUID) {
      if (byUUIDLookUp.hasOwnProperty(node.UUID)) {
        ancestors[node.UUID] = true;
        // check for parents array
        if (node.Parents.length > 0) {
          for (let nodeParent of node.Parents) {
            var parentUUID = byIdLookUp[nodeParent];
            add_ancestors(dagNodes[parentUUID]);
          }
        }
      }
    }
  }
  add_ancestors(dagNodes[chosenNode]);

  var base_key_regex = /^(.*)(_\d)$/;

  for (var instanceKey in instances) {
    // skip this if RepoUUID is not in ancestors list
    if (
      nodeRestrict === false ||
      ancestors.hasOwnProperty(instances[instanceKey].Base.RepoUUID)
    ) {
      if (instances.hasOwnProperty(instanceKey)) {
        var match = base_key_regex.exec(instanceKey);
        if (match) {
          sorted.push([
            instanceKey,
            instances[instanceKey],
            match[1] + "_" + instances[instanceKey].Base.TypeName,
          ]);
          parents[match[1] + "_" + instances[instanceKey].Base.TypeName] = 1;
        } else {
          sorted.push([instanceKey, instances[instanceKey]]);
        }
      }
    }
  }

  // returns the data instances sorted by type then name.
  sorted.sort(function (a, b) {
    var aType = a[1].Base.TypeName;
    var bType = b[1].Base.TypeName;
    // first see if we have the same type of instance
    if (aType === bType) {
      // same instance type, so sort by the instance name.
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      return 0;
    } else {
      // sort by the type.
      if (aType < bType) return -1;
      if (aType > bType) return 1;
    }
    return 0;
  });

  return [sorted, parents];
}

export default function DataInstanceList({
  uuid,
  instances,
  dag,
  nodeRestrict,
  onImageSelect,
  onLabelSelect,
}) {
  const [showSubInstances, setShowSubInstances] = useState(false);
  const { isLoading, isError, data, error } = useQuery(
    "defaultInstance",
    () => getDefaultInstances(uuid),
    { retry: false }
  );

  const [sorted, parents] = dataInstancesForNode(
    instances,
    uuid,
    dag.Nodes,
    nodeRestrict
  );

  const rows = sorted.map((row) => {
    const type = row[1].Base.TypeName;
    const isParent = parents[`${row[0]}_${type}`];
    var isChild = !!row[2];

    // if this is a child node and showSubInstances is turned off,
    // then it needs to be removed from the list.
    if (isChild && !showSubInstances) {
      return undefined;
    }

    return (
      <DataInstance
        key={row[0]}
        instance={row[1]}
        isParent={isParent}
        uuid={uuid}
        show={false}
        onImageSelect={onImageSelect}
        onLabelSelect={onLabelSelect}
      />
    );
  });

  function handleSubInstanceToggle() {
    setShowSubInstances((prevState) => !prevState);
  }

  return (
    <div>
      <table className="datainstances">
        <thead>
          <tr>
            <th>
              Data Instance{" "}
              <IconButton
                onClick={handleSubInstanceToggle}
                variant="link"
                size="small"
              >
                [{showSubInstances ? "-" : "+"}]
              </IconButton>
            </th>
            <th>Type</th>
            <th>Image Source</th>
            <th>Label Source</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
