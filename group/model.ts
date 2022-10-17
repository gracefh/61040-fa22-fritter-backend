import type {Freet} from 'freet/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from 'user/model';

/**
 * This file defines the properties stored in a User
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for User on the backend
export type Group = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  name: string;
  description: string;
  owner: Types.ObjectId;
  moderators: Set<Types.ObjectId>;
  members: Set<Types.ObjectId>;
  freets: Set<Types.ObjectId>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Groups stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const GroupSchema = new Schema({
  // The group's name
  name: {
    type: String,
    required: true
  },
  // The group's description
  description: {
    type: String,
    required: true
  },
  // The owner of the group
  owner: {
    type: Schema.Types.ObjectId,
    required: true
  },
  moderators: {
    type: [Schema.Types.ObjectId],
    required: true
  },
  members: {
    type: [Schema.Types.ObjectId],
    required: true
  },
  freets: {
    type: [Schema.Types.ObjectId],
    required: true
  }
});

const GroupModel = model<Group>('Group', GroupSchema);
export default GroupModel;
