import type { HydratedDocument } from "mongoose";
import type { Moderation, PopulatedModeration } from "../moderation/model";

// Update this if you add a property to the Freet type!
export type ModerationResponse = {
  _id: string;
  user: string;
  group: string;
};

/**
 * Transform a raw Moderation object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Moderation>} moderation - A Moderation object
 * @returns {ModerationResponse} - The Moderation object formatted for the frontend
 */
const constructModerationResponse = (
  moderation: HydratedDocument<Moderation>
): ModerationResponse => {
  const moderationCopy: PopulatedModeration = {
    ...moderation.toObject({
      versionKey: false, // Cosmetics; prevents returning of __v property
    }),
  };

  const { username } = moderationCopy.userId;
  const { name } = moderationCopy.groupId;
  delete moderationCopy.userId;
  delete moderationCopy.groupId;
  return {
    ...moderationCopy,
    _id: moderationCopy._id.toString(),
    user: username,
    group: name,
  };
};

export { constructModerationResponse };
