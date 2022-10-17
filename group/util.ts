import type { HydratedDocument } from "mongoose";
import type { Group } from "./model";
import { UserResponse } from "user/util";
import { formatDate, FreetResponse } from "freet/util";

type GroupResponse = {
  _id: string;
  name: string;
  description: string;
  owner: UserResponse;
  moderators: UserResponse[];
  members: UserResponse[];
  freets: FreetResponse[];
};

/**
 * Transform a raw Group object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Group>} group - A group object
 * @returns {GroupResponse} - The group object
 */
export const constructGroupResponse = (
  group: HydratedDocument<Group>
): GroupResponse => {
  const groupCopy: Group = {
    ...group.toObject({
      versionKey: false, // Cosmetics; prevents returning of __v property
    }),
  };

  const members = Array.from(groupCopy.members.values()).map((user) => {
    return {
      _id: user._id.toString(),
      username: user.username,
      dateJoined: formatDate(user.dateJoined),
    };
  }); // remove password

  const moderators = Array.from(groupCopy.moderators.values()).map((user) => {
    return {
      _id: user._id.toString(),
      username: user.username,
      dateJoined: formatDate(user.dateJoined),
    };
  }); // remove password

  const owner = {
    _id: groupCopy.owner._id.toString(),
    username: groupCopy.owner.username,
    dateJoined: formatDate(groupCopy.owner.dateJoined),
  };

  const freets = Array.from(groupCopy.freets.values()).map((freet) => {
    return {
      _id: freet._id.toString(),
      author: freet.authorId.toString(),
      content: freet.content,
      dateCreated: formatDate(freet.dateCreated),
      dateModified: formatDate(freet.dateModified),
    };
  });

  return {
    ...groupCopy,
    _id: groupCopy._id.toString(),
    members: members,
    moderators: moderators,
    owner: owner,
    freets: freets,
  };
};
