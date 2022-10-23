function getAllGroups(fields) {
  fetch("/api/groups").then(showResponse).catch(showResponse);
}

function getAllMemberGroups(fields) {
  fetch("/api/groups/member").then(showResponse).catch(showResponse);
}

function getAllMemberGroupsWithRole(fields) {
  fetch(`/api/groups/member?role=${fields.role}`)
    .then(showResponse)
    .catch(showResponse);
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

// TODO: MOVE TO OWNER
function deleteGroup(fields) {
  fetch(`/api/groups/${fields.groupId}`, { method: "DELETE" })
    .then(showResponse)
    .catch(showResponse);
}

// Join a group
function joinGroup(fields) {
  fetch(`/api/groups/${fields.groupId}/member`, { method: "POST" })
    .then(showResponse)
    .catch(showResponse);
}

// Leave a group
function leaveGroup(fields) {
  fetch(`/api/groups/${fields.groupId}/member`, { method: "DELETE" })
    .then(showResponse)
    .catch(showResponse);
}

// Post to group
function postFreetToGroup(fields) {
  fetch(`/api/groups/${fields.groupId}/freets`, {
    method: "POST",
    body: JSON.stringify(fields),
    headers: { "Content-Type": "application/json" },
  })
    .then(showResponse)
    .catch(showResponse);
}
