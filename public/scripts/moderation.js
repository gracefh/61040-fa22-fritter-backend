function getModeratorsForGroup(fields) {
  fetch(`/api/moderation/groups?groupId=${fields.groupId}`)
  .then(showResponse)
  .catch(showResponse);
}

function removeFreetFromGroup(fields) {
  fetch(`/api/moderation/groups/${fields.groupId}/freets/${fields.freetId}`, {
    method: "DELETE",
  })
    .then(showResponse)
    .catch(showResponse);
}

function removeUserFromGroup(fields) {
  fetch(`/api/moderation/groups/${fields.groupId}/users/${fields.userId}`, {
    method: "DELETE",
  })
    .then(showResponse)
    .catch(showResponse);
}
