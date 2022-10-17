import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import GroupCollection from '../group/collection';

/**
 * Checks if a group with groupId in req.params exists
 */
const doesGroupExist = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.groupId);
  const group = validFormat ? await GroupCollection.findOneByGroupId(req.params.groupId) : '';
  if (!group) {
    res.status(404).json({
      error: {
        groupNotFound: `Group with group ID ${req.params.groupId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a group name in req.body is already in use
 */
 const isGroupNameNotAlreadyInUse = async (req: Request, res: Response, next: NextFunction) => {
    const group = await GroupCollection.findOneByGroupName(req.body.groupname);
  
    if (!group) {
      next();
      return;
    }
  
    res.status(409).json({
      error: {
        groupname: 'A group with this name already exists.'
      }
    });
  };

export {
    doesGroupExist, isGroupNameNotAlreadyInUse
  };