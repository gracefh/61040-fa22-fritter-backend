import type { HydratedDocument, Types } from "mongoose";
import UserCollection from "user/collection";
import type { Activity } from "./model";
import ActivityModel from "./model";

/**
 * This file contains a class with functionality to interact with activity data stored
 * in MongoDB, including adding, finding, updating, and deleting. Feel free to add
 * additional operations in this file.
 *
 * Note: HydratedDocument<Activity> is the output of the ActivityModel() constructor,
 * and contains all the information in Activity. https://mongoosejs.com/docs/typescript.html
 */
class ActivityCollection {
  /**
   * Create a new Activity
   *
   * @param {Types.ObjectId | string} userId - user id associated with activity tracker
   * @param {Boolean} currentlyActive - whether the user is currently logged in or not, defaults to false
   * @param {Date} timeLastLoggedIn - the last time the user logged in, defaults to undefined
   * @return {Promise<HydratedDocument<Activity>>} - The newly created Activity object
   */
  static async createActivity(
    userId: Types.ObjectId | string,
    currentlyActive: Boolean = false,
    timeLastLoggedIn: Date = undefined
  ): Promise<HydratedDocument<Activity>> {
    const user = await UserCollection.findOneByUserId(userId);
    const lastLoggedIn = timeLastLoggedIn ?? user.dateJoined;

    const activity = new ActivityModel({
      userId: userId,
      timeToday: 0,
      averageTime: 0,
      timePastWeek: [0, 0, 0, 0, 0, 0, 0],
      currentlyActive: currentlyActive,
      timeLastLoggedIn: lastLoggedIn,
    });

    await activity.save(); // Saves group to MongoDB
    return activity;
  }

  /**
   * Find an Activity from its id
   *
   * @param {id} id - the id to query for
   * @return {Promise<HydratedDocument<Activity>>} - The associated Activity object
   */
  static async findOne(
    id: Types.ObjectId | string
  ): Promise<HydratedDocument<Activity>> {
    return ActivityModel.findOne({ _id: id });
  }


  /**
   * Find an Activity from a user Id
   *
   * @param {userId} userId - the user id to query for
   * @return {Promise<HydratedDocument<Activity>>} - The associated Activity object
   */
  static async findOneByUserId(
    userId: Types.ObjectId | string
  ): Promise<HydratedDocument<Activity>> {
    return ActivityModel.findOne({ userId: userId });
  }
}

export default ActivityCollection;
