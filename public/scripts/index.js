// Show an object on the screen.
function showObject(obj) {
  const pre = document.getElementById("response");
  const preParent = pre.parentElement;
  pre.innerText = JSON.stringify(obj, null, 4);
  preParent.classList.add("flashing");
  setTimeout(() => {
    preParent.classList.remove("flashing");
  }, 300);
}

function showResponse(response) {
  response.json().then((data) => {
    showObject({
      data,
      status: response.status,
      statusText: response.statusText,
    });
  });
}

/**
 * IT IS UNLIKELY THAT YOU WILL WANT TO EDIT THE CODE ABOVE.
 * EDIT THE CODE BELOW TO SEND REQUESTS TO YOUR API.
 *
 * Native browser Fetch API documentation to fetch resources: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */

// Map form (by id) to the function that should be called on submit
const formsAndHandlers = {
  "create-user": createUser,
  "delete-user": deleteUser,
  "change-username": changeUsername,
  "change-password": changePassword,
  "sign-in": signIn,
  "sign-out": signOut,
  "view-all-freets": viewAllFreets,
  "view-freets-by-author": viewFreetsByAuthor,
  "create-freet": createFreet,
  "edit-freet": editFreet,
  "delete-freet": deleteFreet,
  "create-group": createGroup,
  "get-all-groups": getAllGroups,
  "get-all-member-groups": getAllMemberGroups,
  "get-all-member-groups-with-role": getAllMemberGroupsWithRole,
  "get-group-by-Id": getGroupById,
  "join-group": joinGroup,
  "leave-group": leaveGroup,
  "post-freet-to-group": postFreetToGroup,
  "get-all-moderators-for-group": getModeratorsForGroup,
  "remove-freet-from-group": removeFreetFromGroup,
  "remove-user-from-group": removeUserFromGroup,
  "get-group-owner": getGroupOwner,
  "change-group-name": changeGroupName,
  "change-group-description": changeGroupDescription,
  "transfer-ownership": transferOwnership,
  "add-moderator": addModerator,
  "remove-moderator": removeModerator,
  "delete-group": deleteGroup,
};

// Attach handlers to forms
function init() {
  Object.entries(formsAndHandlers).forEach(([formID, handler]) => {
    const form = document.getElementById(formID);
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      handler(Object.fromEntries(formData.entries()));
      return false; // Don't reload page
    };
  });
}

// Attach handlers once DOM is ready
window.onload = init;
