import type { NextFunction, Request, Response } from "express";
import express from "express";
import ModerationCollection from "./collection";
import * as groupValidator from "../group/middleware";
import * as userValidator from "../user/middleware";
import * as freetValidator from "../freet/middleware";
import * as moderationValidator from "../moderation/middleware";
import * as util from "./util";
import GroupCollection from "../group/collection";

const router = express.Router();

/**
 * Get all moderators for group associated with one groupId. Returns list of Moderator information, one for each moderator of the group
 *
 * @name GET /api/moderation/groups?groupId=ID
 *
 * @throws {400} if groupId is not given
 * @throws {404} if group doesn't exist
 */
router.get(
  "/groups",
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.groupId !== undefined) {
      next();
      return;
    }
    res.status(400).json({ message: "groupId not given" });
  },
  [groupValidator.doesGroupQueryExist],
  async (req: Request, res: Response) => {
    const moderationArray = await ModerationCollection.findAllByGroup(
      req.query.groupId as string
    );

    const response = moderationArray.map(util.constructModerationResponse);

    res.status(200).json(response);
  }
);

/**
 * Remove freet from group
 *
 * @name DELETE /api/moderation/groups/:groupId?/freets/:freetId?
 *
 * @throws {404} if the freetId is invalid
 * @throws {404} if the groupId is invalid
 * @throws {404} if the freet is not in the group specified by groupId
 * @throws {403} if the user is not a moderator of the group specified by groupId
 * @throws {403} if the user is not logged in
 */
router.delete(
  "/groups/:groupId?/freets/:freetId?",
  [
    groupValidator.doesGroupParamExist,
    freetValidator.isFreetExists,
    userValidator.isUserLoggedIn,
    groupValidator.isFreetInGroup,
    moderationValidator.isUserModerator,
  ],
  async (req: Request, res: Response) => {
    await GroupCollection.deleteFreet(req.params.freetId, req.params.groupId);

    res.status(200).json({
      message: `Freet has been removed from group ${req.params.groupId} successfully`,
    });
  }
);

/**
 * Remove user from group
 *
 * @name DELETE /api/moderation/groups/:groupId?/users/:userId?
 *
 * @throws {404} if the userId is invalid
 * @throws {404} if the groupId is invalid
 * @throws {404} if the user associated with userId is not in the group specified by groupId
 * @throws {403} if the logged in user is not a moderator of the group specified by groupId
 * @throws {403} if the user is not logged in
 */
router.delete(
  "/groups/:groupId?/users/:userId?",
  [
    groupValidator.doesGroupParamExist,
    userValidator.isUserExists,
    userValidator.isUserLoggedIn,
    groupValidator.isUserInGroup,
    groupValidator.isUserParamInGroup,
    moderationValidator.isUserModerator,
  ],
  async (req: Request, res: Response) => {
    await GroupCollection.removeUserFromGroup(
      req.params.userId,
      req.params.groupId
    );

    res.status(200).json({
      message: `User ${req.params.userId} has been removed from group ${req.params.groupId} successfully`,
    });
  }
);

export { router as moderationRouter };
