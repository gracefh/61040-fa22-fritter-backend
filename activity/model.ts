/**
 * This file defines the properties stored in a Group
 */

import { model, Schema, Types } from "mongoose";

// Type definition for Activity Monitor on the backend
export type Activity = {
    _id: Types.ObjectId;    // MongoDB assigns each object this ID on creation
    user: Types.ObjectId;   // associated user
    time_today: number;
    average_time: number;
    time_past_week: Array<number>;
  };
  


// Activity data stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const ActivitySchema = new Schema({
    // The associated user
    user: {
      type: String,
      required: true
    },
    // The time active today
    time_today: {
      type: String,
      required: true
    },
    // Average time over the last week
    average_time: {
      type: Schema.Types.ObjectId,
      required: true
    },
    // Active times for the last week
    time_past_week: {
      type: [Schema.Types.ObjectId],
      required: true
    },
  });
  
  const ActivityModel = model<Activity>('Activity', ActivitySchema);
  export default ActivityModel;
  