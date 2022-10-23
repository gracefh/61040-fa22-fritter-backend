function getGroupOwner(fields) {
  fetch(`api/owner/groups?groupId=${fields.groupId}`)
    .then(showResponse)
    .catch(showResponse);
}

function changeGroupName(fields) {
  fetch(`/api/owner/groups/${fields.groupId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function changeGroupDescription(fields) {
  fetch(`/api/owner/groups/${fields.groupId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function transferOwnership(fields) {
  fetch(`/api/owner/groups/${fields.groupId}/newOwner`, {
    method: "PUT",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function addModerator(fields) {
  fetch(`/api/owner/groups/${fields.groupId}/moderators`, {
    method: "POST",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}

function removeModerator(fields) {
  fetch(`/api/owner/groups/${fields.groupId}/moderators/${fields.userId}`, {
    method: "DELETE",
  })
    .then(showResponse)
    .catch(showResponse);
}

function deleteGroup(fields) {
  fetch(`/api/owner/groups/${fields.groupId}`, { method: "DELETE" })
    .then(showResponse)
    .catch(showResponse);
}
