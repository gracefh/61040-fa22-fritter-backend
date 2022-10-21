import {Request, Response, NextFunction, response} from 'express';
import {Types} from 'mongoose';
import GroupCollection, { Role } from '../group/collection';

/**
 * Checks if a group with groupId in req.params exists
 */
const doesGroupParamExist = async (req: Request, res: Response, next: NextFunction) => {
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
 * Checks if a group with groupId in req.query exists
 */
 const doesGroupQueryExist = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.groupId) {
        res.status(400).json({
            error: 'Provided group Id must be nonempty.'
          });
          return;
    }
    const groupId = req.query.groupId as string
    const validFormat = Types.ObjectId.isValid(groupId);
    const group = validFormat ? await GroupCollection.findOneByGroupId(groupId) : '';
    if (!group) {
      res.status(404).json({
        error: {
          groupNotFound: `Group with group ID ${groupId} does not exist.`
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

/**
 * Checks if the current user is the owner of group whose groupId is in req.params
 */
 const isGroupOwner = async (req: Request, res: Response, next: NextFunction) => {
    const group = await GroupCollection.findOneByGroupId(req.params.groupId);
    const userId = group.owner._id;
    if (req.session.userId !== userId.toString()) {
      res.status(403).json({
        error: 'Cannot modify a group you don\'t own.'
      });
      return;
    }
  
    next();
  };

  
  /**
   * Checks if logged in user is not in group (specified in params). Throws error if the user already is in 
   * the group
   */
const isUserNotInGroup = async (req: Request, res: Response, next: NextFunction) => {
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
  if(group.members.includes(req.session.userId)){
    res.status(409).json({
      error: {
        alreadyMember: `User with userId ${req.session.userId} is already in group ${req.params.groupId}.`
      }
    });
    return;
  }

  next();
}

  /**
   * Checks if logged in user is already in group (specified in params). Throws error if the user is not
   */
   const isUserInGroup = async (req: Request, res: Response, next: NextFunction) => {
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
    if(!group.members.includes(req.session.userId)){
      res.status(409).json({
        error: {
          alreadyMember: `User with userId ${req.session.userId} is not in group ${req.params.groupId}.`
        }
      });
      return;
    }
  
    next();
  }

  /**
   * Checks if role is a valid role (member, moderator, or owner)
   */
const isRoleValid = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.role) {
    res.status(400).json({
      error: 'Provided role must be nonempty.'
    });
    return;
  }

  const role = req.query.role as string;
  if (!Object.values(Role).includes(role as Role))
  {
    res.status(400).json({
      error: `Role ${role} is not valid`
    });
    return;
  }
  next();
}

export {
    doesGroupParamExist, doesGroupQueryExist, isGroupNameNotAlreadyInUse, isGroupOwner, isRoleValid, isUserInGroup, isUserNotInGroup
  };