/**
 * This file defines the properties stored in a Group
 */

import { model, Schema, Types } from "mongoose";

// Type definition for Activity Monitor on the backend
export type Activity = {
    _id: Types.ObjectId;    // MongoDB assigns each object this ID on creation
    user: Types.ObjectId;   // associated user
    timeToday: number;
    averageTime: number;
    timePastWeek: Array<number>;
    currentlyActive: Boolean;
    timeLastLoggedIn: Date;
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
    timeToday: {
      type: String,
      required: true
    },
    // Average time over the last week
    averageTime: {
      type: Schema.Types.ObjectId,
      required: true
    },
    // Active times for the last week
    timePastWeek: {
      type: [Schema.Types.ObjectId],
      required: true
    },
    // Whether user is currently active or not
    currentlyActive: {
      type: Boolean,
      required: true
    },
     // Active times for the last week
     timeLastLoggedIn: {
      type: Date,
      required: true
    },
  });
  
  const ActivityModel = model<Activity>('Activity', ActivitySchema);
  export default ActivityModel;
  