import type { HydratedDocument, Types } from "mongoose";
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
   * @param {Types.ObjectId | string} user_id - user id associated with activity tracker
   * @return {Promise<HydratedDocument<Activity>>} - The newly created Activity object
   */
  static async createActivity(
    user_id: Types.ObjectId | string
  ): Promise<HydratedDocument<Activity>> {
    const activity = new ActivityModel({
        user: user_id,
        time_today: 0,
        average_time: 0,
        time_past_week: [0, 0, 0, 0, 0, 0, 0]
    }
        
    )

    await activity.save(); // Saves group to MongoDB
    return activity;
  }
}

export default ActivityCollection;
