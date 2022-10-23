import { Group } from '../group/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import { User } from '../user/model';

/**
 * Defines Owner Model
 */

export type Owner = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
    groupId: Types.ObjectId;
    userId: Types.ObjectId;
}

export type PopulatedOwner = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
    groupId: Group;
    userId: User;
}

const OwnerSchema = new Schema({
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


const OwnerModel = model<Owner>('Owner', OwnerSchema);
export default OwnerModel;