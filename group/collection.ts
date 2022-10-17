import FreetCollection from "freet/collection";
import { Freet } from "freet/model";
import type { HydratedDocument, Types } from "mongoose";
import { Schema, model } from "mongoose";
import UserCollection from "user/collection";
import type { Group } from "./model";
import GroupModel from "./model";
import UserModel from "./model";

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
    const moderators = new Set([creator]);
    const members = new Set([creator]);
    const posts = new Set<Types.ObjectId>();

    const group = new GroupModel({
      name,
      description,
      owner,
      moderators,
      members,
      posts,
    });

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
    return GroupModel.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
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
   * Get all the freets in a group
   *
   * @param {string} groupId - group Id to find freets from
   *
   * @return {Promise<Array<Freet>>} - An array of all of the freets
   */
  static async findAllFreets(groupId: string): Promise<Array<Freet>> {
    // Retrieves posts and sorts them in backwards time order
    const group = await GroupCollection.findOneByGroupId(groupId);
    if (group === null) {
      return [];
    }
    return Array.from(group.posts.values()).sort(
      (a, b) => b.dateCreated.getTime() - a.dateCreated.getTime()
    );
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
    freetId: string,
    groupId: string
  ): Promise<HydratedDocument<Group>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const freet = await FreetCollection.findOne(freetId);
    if (group === null || freet === null)
      // group or freet doesn't exist
      return null;
    group.posts.add(freet);

    await group.save();
    return group;
  }
  /**
   * Delete freet with given freet id from group with given group id. If freet 
   *
   * @param {string} freetId - freet Id of freet to delete from group
   * @param {string} groupId - group Id to delete freet from
   *
   * @return {boolean} - as described above
   */
   static async deleteFreet(
    freetId: string,
    groupId: string
  ): Promise<HydratedDocument<Group>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const freet = await FreetCollection.findOne(freetId);
    if (group === null || freet === null)
      // group or freet doesn't exist
      return null;
    
    group.posts.add(freet);
    
    await group.save();
    return group;
  }

  /**
   * Add user with given user id to group with given group id, either as
   * a member or a moderator.
   *
   * @param {string} userId - The id of the user to add to the group
   * @param {string} groupId - The id of the group to add the user to
   * @param {string} userType - Either 'member' or 'moderator', what role to add user to
   *                            (moderators are also users, but this eliminates unnecessary reuse of code)
   * @return {Promise<HydratedDocument<Group>>} - The updated group
   */
  static async addUser(
    userId: string,
    groupId: string,
    userType: string
  ): Promise<HydratedDocument<Group>> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    if (group === null || user === null)
      // group or user doesn't exist
      return null;
    if (userType == "member") {
      const members = group.members;
      members.add(user);
    } else if (userType == "moderator") {
      const moderators = group.moderators;
      moderators.add(user);
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
   * @param {string} userId - The id of the user to delete from the group
   * @param {string} groupId - The id of the group to delete the user from
   * @return {Promise<boolean>} - As described above
   */
  static async removeUserFromGroup(
    userId: string,
    groupId: string
  ): Promise<boolean> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    if (group === null || user === null)
      // group or user doesn't exist
      return false;
    const members = group.members;
    const moderators = group.moderators;
    if (!members.has(user) || group.owner === user)
      // group doesn't have user or user is group owner
      return false;

    members.delete(user);
    if (moderators.has(user)) {
      moderators.delete(user); // also remove from moderator position
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
    if (!moderators.has(user) || group.owner === user)
      // user is not moderator or user is group owner
      return false;

    moderators.delete(user);

    await group.save();
    return true;
  }

  /**
   * Transfer ownership of group from one user to another. Since ownership automatically entails
   * membership and moderator status, adds user to those two categories as well if the user isn't
   * already in them.
   *
   * @param {string} userId - Id of user to transfer ownership to
   * @param {string} groupId - Id of group to transfer ownership of
   * @return {Promise<Boolean>} - true if ownership has been transferred; false otherwise
   */
  static async transferOwnership(
    userId: string,
    groupId: string
  ): Promise<boolean> {
    const group = await GroupCollection.findOneByGroupId(groupId);
    const user = await UserCollection.findOneByUserId(userId);
    if (group === null || user === null) {
      return false;
    }
    group.owner = user;
    if (!group.members.has(user)) {
      group.members.add(user);
    }
    if (!group.moderators.has(user)) {
      group.moderators.add(user);
    }
    return true;
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
