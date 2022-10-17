function getAllGroups(fields) {
  fetch("/api/groups").then(showResponse).catch(showResponse);
}

function getAllMemberGroups(fields) {
  fetch("/api/groups/membership").then(showResponse).catch(showResponse);
}

function getGroupById(fields) {
  fetch(`/api/groups?groupId=${fields.groupId}`)
    .then(showResponse)
    .catch(showResponse);
}

function createGroup(fields) {
  fetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function changeGroupName(fields) {
  fetch(`/api/groups/${fields.groupId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function changeGroupDescription(fields) {
  fetch(`/api/groups/${fields.groupId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function deleteGroup(fields) {
  fetch(`/api/groups/${fields.groupId}`, { method: "DELETE" })
    .then(showResponse)
    .catch(showResponse);
}
