import { Request, Response, NextFunction, response } from "express";
import GroupCollection from "../group/collection";
import ModerationCollection from "../moderation/collection";
import { Types } from "mongoose";

/**
 * Checks if current logged in user is a moderator of the group
 */
 const isUserModerator = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const curSession = req.session.userId;
    const validGroupFormat = Types.ObjectId.isValid(req.params.groupId)
    const group = validGroupFormat
    ? await GroupCollection.findOneByGroupId(req.params.groupId)
    : "";

    if(!group) {
        res.status(404).json({
            error: {
              groupNotFound: `Group with group ID ${req.params.groupId} does not exist.`,
            },
          });
          return;
    }
    const result = ModerationCollection.findOneByGroupAndUser(curSession, group._id);
    if(!result)
    {
        res.status(403).json({
            error: {
                userNotModerator: `Current logged in user is not moderator of group with group Id ${req.params.groupId}`
            }
        });
        return;
    }
  
    next();
  };

export {isUserModerator};