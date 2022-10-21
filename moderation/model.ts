import { Group } from 'group/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import { User } from 'user/model';

/**
 * This file defines the properties stored in a Moderation object
 */

// Type definition for Moderation on the backend
export type Moderation = {
    _id: Schema.Types.ObjectId; // MongoDB assigns each object this ID on creation
    groupId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
}

export type PopulatedModeration = {
    _id: Schema.Types.ObjectId; // MongoDB assigns each object this ID on creation
    groupId: Group;
    userId: User;
}

const ModerationSchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Group'
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const ModerationModel = model<Moderation>('Moderation', ModerationSchema);
export default ModerationModel;