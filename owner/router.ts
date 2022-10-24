import type { NextFunction, Request, Response } from "express";
import express from "express";
import * as groupValidator from "../group/middleware";
import * as userValidator from "../user/middleware";
import * as ownerValidator from "../owner/middleware";
import * as moderationValidator from "../moderation/middleware";
import * as util from "./util";
import * as groupUtil from "../group/util";
import GroupCollection from "../group/collection";
import OwnerCollection from "./collection";

const router = express.Router();

/**
 * Update an existing group's information
 *
 * @name PUT /api/owner/groups/:groupId
 *
 * @param {string} name - updated name of the group
 * @param {string} description - updated description of the group
 *
 * @return {GroupResponse} - The updated group
 *
 * @throws {403} - If user is not logged in
 * @throws {403} - If user is not owner of group with groupId
 * @throws {404} - If group not found
 * @throws {409} - If group already in use
 *
 */
router.put(
  "/groups/:groupId?",
  [
    userValidator.isUserLoggedIn,
    ownerValidator.isUserOwner,
    groupValidator.doesGroupParamExist,
    groupValidator.isGroupNameNotAlreadyInUse,
  ],
  async (req: Request, res: Response) => {
    const group = await GroupCollection.updateOne(req.params.groupId, req.body);

    res.status(200).json({
      message: `Your group has been updated successfully`,
      group: groupUtil.constructGroupResponse(group),
    });
  }
);

/**
 * Delete an existing group
 *
 * @name DELETE /api/owner/groups/:groupId?
 *
 * @throws {403} - If user is not logged in
 * @throws {403} - If user is not owner of group with groupId
 * @throws {404} - If group not found
 *
 */
router.delete(
  "/groups/:groupId?",
  [
    groupValidator.doesGroupParamExist,
    userValidator.isUserLoggedIn,
    ownerValidator.isUserOwner,
  ],
  async (req: Request, res: Response) => {
    await GroupCollection.deleteOne(req.params.groupId);

    res.status(200).json({
      message: `Your group has been deleted successfully`,
    });
  }
);

/**
 * Add user as moderator to group
 *
 * @name POST /api/owner/groups/:groupId?/moderators
 *
 * @param {string} userId   userId of user to add to group
 *
 * @return {GroupResponse} - updated group details of group
 *
 * @throws {403} - If user is not logged in
 * @throws {403} - If logged in user is not owner of group with groupId
 * @throws {404} - If groupId is invalid
 * @throws {404} - If userId is invalid
 * @throws {409} - If user specified by userId is already moderator of group specified by groupId
 *
 */
router.post(
  "/groups/:groupId?/moderators",
  [
    groupValidator.doesGroupParamExist,
    userValidator.isUserBodyExists,
    userValidator.isUserLoggedIn,
    moderationValidator.isUserBodyNotAlreadyModerator,
    ownerValidator.isUserOwner,
  ],
  async (req: Request, res: Response) => {
    const group = await GroupCollection.addUser(
      req.body.userId,
      req.params.groupId,
      "moderator"
    );

    res.status(200).json({
      message: `User ${req.body.userId} has been successfully added as a moderator`,
      group: groupUtil.constructGroupResponse(group),
    });
  }
);

/**
 * Remove user from moderator position in group
 *
 * @name DELETE /api/owner/groups/:groupId?/moderators/:userId?
 *
 * @throws {403} - If user is not logged in
 * @throws {403} - If logged in user is not owner of group with groupId
 * @throws {404} - If groupId is invalid
 * @throws {404} - If userId is invalid
 * @throws {409} - If user specified by userId is not already moderator of group specified by groupId
 *
 */
router.delete(
  "/groups/:groupId?/moderators/:userId?",
  [
    groupValidator.doesGroupParamExist,
    userValidator.isUserExists,
    userValidator.isUserLoggedIn,
    moderationValidator.isUserParamModerator,
    ownerValidator.isUserOwner,
  ],
  async (req: Request, res: Response) => {
    await GroupCollection.removeUserFromModerator(
      req.params.userId,
      req.params.groupId
    );

    res.status(200).json({
      message: `User ${req.params.userId} has been successfully deleted as a moderator`,
    });
  }
);

/**
 * Transfer ownership of group to another user
 *
 * @name PUT /api/owner/groups/:groupId?/newOwner
 *
 * @param {string} userId - Id of user to transfer ownership to
 *
 * @return {OwnerResponse} - updated Owner object that's associated with group
 *
 * @throws {403} if the user is not logged in
 * @throws {403} if the logged in user is not the group owner of the specified group
 * @throws {404} if the groupId is invalid
 * @throws {404} if the userId is invalid
 * @throws {409} if the userId given is the same as the current logged in user's id
 *
 */
router.put(
  "/groups/:groupId?/newOwner",
  [
    groupValidator.doesGroupParamExist,
    userValidator.isUserBodyExists,
    userValidator.isUserLoggedIn,
    ownerValidator.isUserOwner,
    ownerValidator.isUserBodyNotCurrentUser,
  ],
  async (req: Request, res: Response) => {
    const owner = await GroupCollection.transferOwnership(
      req.body.userId,
      req.params.groupId
    );

    res.status(200).json({
      message: `User ${req.body.userId} has been successfully made into owner`,
      owner: util.constructOwnerResponse(owner),
    });
  }
);

/**
 * Get owner for group associated with one groupId.
 *
 * @name GET /api/owner/groups?groupId=ID
 *
 * @return {OwnerResponse} owner associated with the group
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
    const owner = await OwnerCollection.findOneByGroupId(
      req.query.groupId as string
    );

    const response = util.constructOwnerResponse(owner);

    res.status(200).json(response);
  }
);

export { router as ownerRouter };
