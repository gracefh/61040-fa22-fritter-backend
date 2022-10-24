import { Request, Response, NextFunction, response } from "express";
import GroupCollection from "../group/collection";
import ModerationCollection from "../moderation/collection";
import { Types } from "mongoose";
import UserCollection from "../user/collection";

/**
 * Checks if current logged in user is a moderator of the group
 */
const isUserModerator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const curSession = req.session.userId;
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
  const result = ModerationCollection.findOneByGroupAndUser(
    curSession,
    group._id
  );
  if (!result) {
    res.status(403).json({
      error: {
        userNotModerator: `Current logged in user is not moderator of group with group Id ${req.params.groupId}`,
      },
    });
    return;
  }

  next();
};

/**
 * Checks if current user passed in as body is not already a moderator of the group
 */
const isUserBodyNotAlreadyModerator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validUserFormat = Types.ObjectId.isValid(req.body.userId);
  const validGroupFormat = Types.ObjectId.isValid(req.params.groupId);
  const group = validGroupFormat
    ? await GroupCollection.findOneByGroupId(req.params.groupId)
    : "";

  const user = validUserFormat
    ? await UserCollection.findOneByUserId(req.body.userId)
    : "";

  if (!group) {
    res.status(404).json({
      error: {
        groupNotFound: `Group with group ID ${req.params.groupId} does not exist.`,
      },
    });
    return;
  }
  if (!user) {
    res.status(404).json({
      error: {
        userNotFound: `User with user ID ${req.body.userId} does not exist.`,
      },
    });
    return;
  }

  const result = await ModerationCollection.findOneByGroupAndUser(
    user._id,
    group._id
  );

  console.log(result);
  if (result !== null) {
    res.status(409).json({
      error: {
        userAlreadyModerator: `User with userId ${req.body.userId} is already moderator of group with group Id ${req.params.groupId}`,
      },
    });
    return;
  }

  next();
};

/**
 * Checks if current user passed in as param is currently moderator of the group
 */
const isUserParamModerator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validUserFormat = Types.ObjectId.isValid(req.params.userId);
  const validGroupFormat = Types.ObjectId.isValid(req.params.groupId);
  const group = validGroupFormat
    ? await GroupCollection.findOneByGroupId(req.params.groupId)
    : "";

  const user = validUserFormat
    ? await UserCollection.findOneByUserId(req.params.userId)
    : "";

  if (!group) {
    res.status(404).json({
      error: {
        groupNotFound: `Group with group ID ${req.params.groupId} does not exist.`,
      },
    });
    return;
  }
  if (!user) {
    res.status(404).json({
      error: {
        userNotFound: `User with user ID ${req.params.userId} does not exist.`,
      },
    });
    return;
  }

  const result = await ModerationCollection.findOneByGroupAndUser(
    user._id,
    group._id
  );
  if (!result) {
    res.status(403).json({
      error: {
        userNotModerator: `User with userId ${req.params.userId} is not moderator of group with group Id ${req.params.groupId}`,
      },
    });
    return;
  }

  next();
};

export { isUserModerator, isUserBodyNotAlreadyModerator, isUserParamModerator };
