import type { HydratedDocument } from "mongoose";
import type { Owner, PopulatedOwner } from "../owner/model";

// Update this if you add a property to the Freet type!
export type OwnerResponse = {
  _id: string;
  user: string;
  group: string;
};

/**
 * Transform a raw Owner object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Owner>} owner - An Owner object
 * @returns {OwnerObject} - The Owner object formatted for the frontend
 */
const constructOwnerResponse = (
  owner: HydratedDocument<Owner>
): OwnerResponse => {
  const ownerCopy: PopulatedOwner = {
    ...owner.toObject({
      versionKey: false, // Cosmetics; prevents returning of __v property
    }),
  };

  const { username } = ownerCopy.userId;
  const { name } = ownerCopy.groupId;
  delete ownerCopy.userId;
  delete ownerCopy.groupId;
  return {
    ...ownerCopy,
    _id: ownerCopy._id.toString(),
    user: username,
    group: name,
  };
};

export { constructOwnerResponse };
