import type { HydratedDocument } from "mongoose";
import type { Group } from "./model";
import { UserResponse } from "../user/util";
import { formatDate, FreetResponse } from "../freet/util";

type GroupResponse = {
  _id: string;
  name: string;
  description: string;
  owner: string;
  moderators: string[];
  members: string[];
  freets: string[];
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

  return {
    ...groupCopy,
    _id: groupCopy._id.toString(),
    members: Array.from(groupCopy.members.values()).map((id) => id.toString()),
    moderators: Array.from(groupCopy.moderators.values()).map((id) =>
      id.toString()
    ),
    owner: groupCopy.owner.toString(),
    freets: Array.from(groupCopy.freets.values()).map((id) => id.toString()),
  };
};
