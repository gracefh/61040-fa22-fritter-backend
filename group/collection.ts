import FreetCollection from "../freet/collection";
import type { HydratedDocument, Types } from "mongoose";
import UserCollection from "../user/collection";
import type { Group } from "./model";
import GroupModel from "./model";
import ModerationCollection from "../moderation/collection";
import OwnerCollection from "../owner/collection";
import { Owner } from "../owner/model";

export enum Role {
  Member = "member",
  Moderator = "moderator",
  Owner = "owner",
}

/**
 * This file contains a class with functionality to interact with groups stored
 * in MongoDB, including adding, finding, updating, and deleting. Feel free to add
 * additional operations in this file.
 *
 * Note: HydratedDocument<Group> is the output of the GroupModel() constructor,
 * and contains all the information in Group. https://mongoosejs.com/docs/typescript.html
 */
class GroupCollection {
  /**
   * Create a new Group
   *
   * @param {string} name - The name of the group
   * @param {string} description - The description of the group
   * @param {string} creator - The id of the creator of the group
   * @return {Promise<HydratedDocument<Group>>} - The newly created user
   */
  static async createGroup(
    name: string,
    description: string,
    creator: Types.ObjectId | string
  ): Promise<HydratedDocument<Group>> {
    const owner = creator;
    const moderators = [creator];
    const members = [creator];
    const freets = new Array<Types.ObjectId>();

    const group = new GroupModel({
      name,
      description,
      owner,
      moderators,
      members,
      freets,
    });

    await ModerationCollection.addModeration(group._id, creator);
    await OwnerCollection.addOwner(group._id, creator);

    await group.save(); // Saves group to MongoDB
    return group;
  }

  /**
   * Find a group by groupId
   *
   * @param {string} groupId - The id of the group to find
   * @return {Promise<HydratedDocument<Group>> | Promise<null> } - The group with the given groupId, if any
   */
  static async findOneByGroupId(
    groupId: Types.ObjectId | string
  ): Promise<HydratedDocument<Group>> {
    return GroupModel.findOne({ _id: groupId });
  }

  /**
   * Find a group by name
   *
   * @param {string} name - The name of the group to find
   * @return {Promise<HydratedDocument<Group>> | Promise<null> } - The group with the given name, if any
   */
  static async findOneByGroupName(
    name: string
  ): Promise<HydratedDocument<Group>> {
    return GroupModel.findOne({ name: name });
  }

  /**
   * Get all the groups in the database
   *
   * @return {Promise<HydratedDocument<Group>[]>} - An array of all of the groups
   */
  static async findAll(): Promise<Array<HydratedDocument<Group>>> {
    // Retrieves groups and sorts them in alphabetical order
    return GroupModel.find({}).sort({ name: 1 });
  }

  /**
   * Get all the groups in the database that a specified user is a member of
   *
   * @param {string} userId - The id of the user to query
   *
   * @return {Promise<HydratedDocument<Group>[]>} - An array of all of the groups that the user is in, sorted alphabetically
   */
  static async findAllWithUser(
    userId: string | Types.ObjectId
  ): Promise<Array<HydratedDocument<Group>>> {
    // Retrieves groups and sorts them in alphabetical order
    const user = await UserCollection.findOneByUserId(userId);
    const allGroups = await GroupCollection.findAll();
    return allGroups.filter(
      (group) => group.members.length > 0 && group.members.includes(user._id)
    );
  }

  /**
   * Delete user from all groups that the user is part of
   *
   * @param {string} userId - The id of the user to query
   *
   * @return {Promise<void>}
   */
  static async deleteUserFromAllGroups(
    userId: string | Types.ObjectId
  ): Promise<void> {
    const groups = await this.findAllWithUser(userId);
    await Promise.all(
      groups.map((group) =>
        GroupCollection.removeUserFromGroup(userId, group._id)
      )
    );
  }

  /**
   * Get all the groups in the database that a specified user is a member of and has a specified role in
   * @param {Role} role - The role being queried for
   * @param {string} userId - The id of the user to query
   *
   * @return {Promise<HydratedDocument<Group>[]>} - An array of all of the groups that the user is in such that the user
   *                                                has the associated role, sorted alphabetically
   */
  static async findAllWithUserRole(
    userId: string,
    role: Role
  ): Promise<Array<HydratedDocument<Group>>> {
    const user = await UserCollection.findOneByUserId(userId);
    const allGroups = await GroupCollection.findAll();

    if (role === Role.Member)
      return allGroups.filter(
        (group) => group.members.length > 0 && group.members.includes(user._id)
      );
    else if (role === Role.Moderator)
      return allGroups.filter(
        (group) =>
          group.moderators.length > 0 && group.moderators.includes(user._id)
      );

    return GroupModel.find({ owner: userId });
  }

  /**
   * Update group's information
   *
   * @param {string} groupId - The userId of the user to update
   * @param {Object} groupDetails - An object with the group's updated info (name/description)
   * @return {Promise<HydratedDocument<Group>>} - The updated Group
   */
  static async updateOne(
    groupId: Types.ObjectId | string,
    groupDetails: any
  ): Promise<HydratedDocument<Group>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    if (groupDetails.name) {
      group.name = groupDetails.name as string;
    }

    if (groupDetails.description) {
      group.description = groupDetails.description as string;
    }

    await group.save();

    return group;
  }

  /**
   * Get all the freets in a group
   *
   * @param {string} groupId - group Id to find freets from
   *
   * @return {Promise<Array<Types.ObjectId>>} - An array of all of the freet Id's
   */
  static async findAllFreets(groupId: string): Promise<Array<Types.ObjectId>> {
    // Retrieves freets and sorts them in backwards time order
    const group = await GroupCollection.findOneByGroupId(groupId);
    if (group === null) {
      return [];
    }

    // const freets = await Promise.all(Array.from(group.freets.values()).map(async (freetId) => await FreetCollection.findOne(freetId)));
    return group.freets;
  }

  /**
   * Add freet with given freet id to group with given group id
   *
   * @param {string} freetId - freet Id to add to group
   * @param {string} groupId - group Id to add freet to
   *
   * @return {Promise<HydratedDocument<Group>>} - the updated group
   */
  static async addFreet(
    freetId: string | Types.ObjectId,
    groupId: string | Types.ObjectId
  ): Promise<HydratedDocument<Group>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const freet = await FreetCollection.findOne(freetId);
    if (group === null || freet === null)
      // group or freet doesn't exist
      return null;
    group.freets.push(freet._id);

    await group.save();
    return group;
  }

  /**
   * Delete freet with given freet id from group with given group id. If freet doesn't exist, is not in the group,
   * or the group doesn't exist, return false. If the freet was successfully deleted, return true
   *
   * @param {string} freetId - freet Id of freet to delete from group
   * @param {string} groupId - group Id to delete freet from
   *
   * @return {boolean} - as described above
   */
  static async deleteFreet(
    freetId: string | Types.ObjectId,
    groupId: string | Types.ObjectId
  ): Promise<boolean> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const freet = await FreetCollection.findOne(freetId);
    if (group === null || freet === null)
      // group or freet doesn't exist
      return false;

    const freets = group.freets;
    if (!freets.includes(freet._id)) return false;

    freets.splice(freets.indexOf(freet._id), 1);

    await group.save();
    return true;
  }

  /**
   * Add user with given user id to group with given group id, either as
   * a member or a moderator.
   *
   * @param {string | Types.ObjectId} userId - The id of the user to add to the group
   * @param {string | Types.ObjectId} groupId - The id of the group to add the user to
   * @param {string} userType - Either 'member' or 'moderator', what role to add user to
   *                            (moderators are also users, but this eliminates unnecessary reuse of code)
   * @return {Promise<HydratedDocument<Group>>} - The updated group
   */
  static async addUser(
    userId: string | Types.ObjectId,
    groupId: string | Types.ObjectId,
    userType: string
  ): Promise<HydratedDocument<Group>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    if (group === null || user === null)
      // group or user doesn't exist
      return null;
    if (userType == "member") {
      const members = group.members;
      members.push(user._id);
    } else if (userType == "moderator") {
      const moderators = group.moderators;
      moderators.push(user._id);
      ModerationCollection.addModeration(group._id, user._id);
    } else {
      return null; // return null without doing anything if unexpected input
    }

    await group.save();
    return group;
  }

  /**
   * Remove user from group with given user id from group with given group id. This function removes the user along with
   * any possible moderator privileges as well. If the user is the owner, does not do anything, as there has to
   * be a group owner at all times. If the user isn't already in the group or the group doesn't exist, also
   * does nothing. If the deletion is unsuccessful (as outlined previously), return false. Otherwise, returns true
   *
   * @param {string | Types.ObjectId} userId - The id of the user to delete from the group
   * @param {string | Types.ObjectId} groupId - The id of the group to delete the user from
   * @return {Promise<boolean>} - As described above
   */
  static async removeUserFromGroup(
    userId: string | Types.ObjectId,
    groupId: string | Types.ObjectId
  ): Promise<boolean> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    if (group === null || user === null)
      // group or user doesn't exist
      return false;

    const id = user._id;
    const members = group.members;
    const moderators = group.moderators;
    if (!members.includes(id) || group.owner === id)
      // group doesn't have user or user is group owner
      return false;

    members.splice(members.indexOf(id), 1);
    if (moderators.includes(id)) {
      moderators.splice(moderators.indexOf(id), 1); // also remove from moderator position
      await ModerationCollection.deleteOneByUserIdAndGroupId(id, groupId);
    }

    await group.save();
    return true;
  }

  /**
   * Remove moderator privileges from the user. If the removal is unsuccessful (the user doesn't exist, the
   * user is not in the group, the group doesn't exist, the user is currently the group owner
   * or the user is not currently a moderator), returns false.
   * Otherwise, returns true
   *
   * @param {string} userId - The id of the user to remove moderator privileges
   * @param {string} groupId - The id of the group to remove moderator privileges of the user from
   * @return {Promise<boolean>} - As described above
   */
  static async removeUserFromModerator(
    userId: string,
    groupId: string
  ): Promise<boolean> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    if (group === null || user === null)
      // group or user doesn't exist
      return false;

    const moderators = group.moderators;
    if (!moderators.includes(user._id) || group.owner === user._id)
      // user is not moderator or user is group owner
      return false;

    moderators.splice(moderators.indexOf(user._id), 1);
    await ModerationCollection.deleteOneByUserIdAndGroupId(userId, groupId);

    await group.save();
    return true;
  }

  /**
   * Transfer ownership of group from one user to another. Since ownership automatically entails
   * membership and moderator status, adds user to those two categories as well if the user isn't
   * already in them.
   *
   * @param {string | Types.ObjectId} userId - Id of user to transfer ownership to
   * @param {string | Types.ObjectId} groupId - Id of group to transfer ownership of
   * @return {Promise<Owner>} - updated Owner object corresponding to group
   */
  static async transferOwnership(
    userId: string | Types.ObjectId,
    groupId: string | Types.ObjectId
  ): Promise<HydratedDocument<Owner>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    group.owner = user._id;

    const ownerObj = await OwnerCollection.findOneByGroupId(group._id);
    const owner = await OwnerCollection.updateUserId(ownerObj._id, user._id);

    if (!group.members.includes(user._id)) {
      group.members.push(user._id);
    }
    if (!group.moderators.includes(user._id)) {
      group.moderators.push(user._id);
      ModerationCollection.addModeration(group._id, user._id);
    }

    await group.save();
    return owner;
  }

  /**
   * Delete a group by group Id
   *
   * @param {string} groupId - The id of the group
   * @return {Promise<Boolean>} - true if the user has been deleted, false otherwise
   */
  static async deleteOne(groupId: string): Promise<boolean> {
    const group = await GroupModel.deleteOne({ _id: groupId });
    return group !== null;
  }
}

export default GroupCollection;
