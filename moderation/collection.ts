import FreetCollection from "../freet/collection";
import GroupCollection from "../group/collection";
import type { HydratedDocument, Types } from "mongoose";
import UserCollection from "../user/collection";
import ModerationModel, { Moderation } from "./model";

class ModerationCollection {
  /**
   * Add new Moderation object to database
   *
   * @param groupId groupId associated with object
   * @param userId  userId to make moderator
   *
   * @returns Moderation object created
   */
  static async addModeration(
    groupId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<HydratedDocument<Moderation>> {
    const moderation = new ModerationModel({ groupId, userId });

    await moderation.save();
    return (await moderation.populate("groupId")).populate("userId");
  }

  /**
   * Find all moderators associated with group with certain group Id
   *
   * @param groupId group Id to query for
   *
   * @returns Array of Moderation objects associated with group
   */
  static async findAllByGroup(
    groupId: Types.ObjectId | string
  ): Promise<Array<HydratedDocument<Moderation>>> {
    return ModerationModel.find({ groupId: groupId })
      .populate("groupId")
      .populate("userId");
  }

  /**
   * Find all groups associated with user with certain user Id
   *
   * @param userId user Id to query for
   *
   * @returns Array of Moderation objects associated with user
   */
  static async findAllByUser(
    userId: Types.ObjectId | string
  ): Promise<Array<HydratedDocument<Moderation>>> {
    return ModerationModel.find({ userId: userId })
      .populate("groupId")
      .populate("userId");
  }

  /**
   * Find a moderation object by moderation Id
   *
   * @param id id to query for
   *
   * @returns Moderation object associated with id
   */
  static async findOne(
    id: Types.ObjectId | string
  ): Promise<Array<HydratedDocument<Moderation>>> {
    return ModerationModel.findOne({ _id: id })
      .populate("groupId")
      .populate("userId");
  }

  /**
   * Find a moderation object by group Id and User Id
   *
   * @param userId  user Id to query for
   * @param groupId group Id to query for
   *
   * @returns Moderation object associated with given userId and groupId
   */
  static async findOneByGroupAndUser(
    userId: Types.ObjectId | string,
    groupId: Types.ObjectId | string
  ): Promise<HydratedDocument<Moderation>> {
    return ModerationModel.findOne({ groupId: groupId, userId: userId })
      .populate("groupId")
      .populate("userId");
  }

  /**
   * Delete one Moderation object based on id
   *
   * @param id  Id of the Moderation object to delete
   *
   * @returns true if deletion was successful; false otherwise
   */
  static async deleteOne(id: Types.ObjectId | string): Promise<boolean> {
    const moderation = await ModerationModel.deleteOne({ _id: id });
    return moderation !== null;
  }

  /**
   * Delete one Moderation object based on user Id and Group
   *
   * @param userId  User Id of the Moderation object to delete
   * @param groupId Group Id of the Moderation object to delete
   */
  static async deleteOneByUserIdAndGroupId(
    userId: Types.ObjectId | string,
    groupId: Types.ObjectId | string
  ): Promise<boolean> {
    const moderation = await ModerationModel.deleteOne({
      groupId: groupId,
      userId: userId,
    });
    return moderation !== null;
  }

  /**
   * Delete all Moderation objects associated with group Id
   *
   * @param groupId Group Id of the Moderation objects to delete
   */
  static async deleteAllForGroup(
    groupId: Types.ObjectId | string
  ): Promise<void> {
    await ModerationModel.deleteMany({
      groupId: groupId,
    });
  }

  /**
   * Remove a freet from a group, given the group Id of the group to remove it from, user Id of the user
   * that is performing the deletion, and the freetId of the freet to remove.
   *
   *
   * @param groupId     Id of the group to delete freet from
   * @param moderatorId Id of user performing the deletion
   * @param freetId     Id of the freet to delete
   *
   * @returns If the user is not a moderator of the group or the freet does not exist in the group or the deletion
   *          is otherwise unsuccessful, returns false. Otherwise, returns true
   */
  static async removeGroupFreet(
    groupId: Types.ObjectId | string,
    moderatorId: Types.ObjectId | string,
    freetId: Types.ObjectId | string
  ): Promise<boolean> {
    const moderation = await ModerationCollection.findOneByGroupAndUser(
      groupId,
      moderatorId
    );
    const freet = await FreetCollection.findOne(freetId);
    const group = await GroupCollection.findOneByGroupId(groupId);

    if (moderation == null || freet == null || group == null) {
      return false;
    }
    delete freet.group;
    return await GroupCollection.deleteFreet(freetId, groupId);
  }

  /**
   * Remove a user from a group, given the group Id of the group to remove it from, the user Id of the user
   * that is performing the deletion, and the user Id of the user to delete.
   *
   * The removal will not go through if user performing the removal is not a moderator of the group
   * or the user being removed is a moderator as well (or the user is not a member of the group in the first place)
   *
   *
   * @param groupId     Id of the group to delete freet from
   * @param moderatorId Id of user performing the removal
   * @param userId     Id of the user to remove
   *
   * @returns If the removal is successful, return true. If it does not go through or is otherwise unsuccessful, return false.
   */
  static async removeGroupUser(
    groupId: Types.ObjectId | string,
    moderatorId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<boolean> {
    const moderation = await ModerationCollection.findOneByGroupAndUser(
      groupId,
      moderatorId
    );

    const user = await UserCollection.findOneByUserId(userId);
    const userModStatus = await ModerationCollection.findOneByGroupAndUser(
      groupId,
      userId
    );
    const group = await GroupCollection.findOneByGroupId(groupId);

    if (
      moderation == null ||
      user == null ||
      group == null ||
      userModStatus !== null
    ) {
      return false;
    }

    return await GroupCollection.removeUserFromGroup(userId, groupId);
  }
}

export default ModerationCollection;
