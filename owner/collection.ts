import type { HydratedDocument, Types } from "mongoose";
import UserCollection from "../user/collection";
import OwnerModel, { Owner } from "./model";

class OwnerCollection {
  /**
   * Add new Owner object to database
   *
   * @param groupId groupId associated with object
   * @param userId  userId to make owner
   *
   * @returns Owner object created
   */
  static async addOwner(
    groupId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<HydratedDocument<Owner>> {
    const owner = new OwnerModel({ groupId, userId });

    await owner.save();
    return (await owner.populate("groupId")).populate("userId");
  }

  /**
   * Update User Id associated with Owner object with specified id
   *
   * @param Id     id of Owner object
   * @param userId  userId to update
   *
   * @returns Updated owner object
   */
  static async updateUserId(
    id: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<HydratedDocument<Owner>> {
    const owner = await OwnerModel.findOne({ _id: id });
    const user = await UserCollection.findOneByUserId(userId);
    owner.userId = user._id;

    await owner.save();
    return (await owner.populate("groupId")).populate("userId");
  }

  /**
   * Delete one Owner object based on id
   *
   * @param id  Id of the Owner object to delete
   *
   * @returns true if deletion was successful; false otherwise
   */
  static async deleteOne(id: Types.ObjectId | string) {
    const owner = await OwnerModel.deleteOne({ _id: id });
    return owner !== null;
  }

  /**
   * Delete one Owner object based on group Id
   *
   * @param groupId Group Id of the Owner object to delete
   */
  static async deleteOneByGroupId(
    groupId: Types.ObjectId | string
  ): Promise<boolean> {
    const owner = await OwnerModel.deleteOne({
      groupId: groupId,
    });
    return owner !== null;
  }

  /**
   * Find owner by id
   *
   * @param id id of Owner object
   * @returns Owner object with associated id
   */
  static async findOne(
    id: Types.ObjectId | string
  ): Promise<HydratedDocument<Owner>> {
    return OwnerModel.findOne({ _id: id })
      .populate("groupId")
      .populate("userId");
  }

  /**
   * Find owner by group Id
   *
   * @param groupId group Id to query for
   * @returns Owner object with associated groupId
   */
  static async findOneByGroupId(
    groupId: Types.ObjectId | string
  ): Promise<HydratedDocument<Owner>> {
    return OwnerModel.findOne({ groupId: groupId })
      .populate("groupId")
      .populate("userId");
  }

  /**
   * Find all Owner objects associated with user Id
   *
   * @param userId user Id to query for
   */
  static async findAllByUser(userId: Types.ObjectId | string) {
    return OwnerModel.find({ userId: userId })
      .populate("groupId")
      .populate("userId");
  }
}

export default OwnerCollection;
