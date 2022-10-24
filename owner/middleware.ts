import { Request, Response, NextFunction } from "express";
import GroupCollection from "../group/collection";
import { Types } from "mongoose";
import OwnerCollection from "../owner/collection";

/**
 * Checks if current logged in user is a owner of the group
 */
const isUserOwner = async (req: Request, res: Response, next: NextFunction) => {
  const validGroupFormat = Types.ObjectId.isValid(req.params.groupId);
  const group = validGroupFormat
    ? await GroupCollection.findOneByGroupId(req.params.groupId)
    : "";

  if (!group) {
    res.status(404).json({
      error: {
        groupNotFound: `Group with group ID ${req.params.groupId} does not exist.`,
      },
    });
    return;
  }
  const result = await OwnerCollection.findOneByGroupId(group._id);
  if (req.session?.userId !== result.userId._id.toString()) {
    res.status(403).json({
      error: {
        userNotOwner: `Current logged in user is not owner of group with group Id ${req.params.groupId}`,
      },
    });
    return;
  }

  next();
};

/**
 * Checks that user param supplied does not match with current logged in user
 */
const isUserBodyNotCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.userId === req.body?.userId) {
    res.status(403).json({
      error: {
        userMatches: `User id supplied is the same as current logged in user`,
      },
    });
    return;
  }

  next();
};

export { isUserOwner, isUserBodyNotCurrentUser };
