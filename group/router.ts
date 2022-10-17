import type { NextFunction, Request, Response } from "express";
import express from "express";
import GroupCollection from "./collection";
import FreetCollection from "../freet/collection";
import UserCollection from "./collection";
import * as groupValidator from "../group/middleware";
import * as userValidator from "../user/middleware";
import * as freetValidator from "../freet/middleware";
import * as util from "./util";

const router = express.Router();

/**
 * Create a group.
 *
 * @name POST /api/groups
 *
 * @param {string} name - name of the group
 * @param {string} description - description of the group
 * @return {GroupResponse} - The created group
 * @throws {409} - If name is already taken
 *
 */
router.post(
  "/",
  [userValidator.isUserLoggedIn, groupValidator.isGroupNameNotAlreadyInUse],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since its validated in isUserLoggedIn
    const group = await GroupCollection.createGroup(
      req.body.name,
      req.body.description,
      userId
    );

    res.status(201).json({
      message: `Your group has been created succesfsfully`,
      group: util.constructGroupResponse(group),
    });
  }
);

/**
 * Update an existing group's information
 *
 * @name PUT /api/groups/:groupId
 *
 * @param {string} name - updated name of the group
 * @param {string} description - updated description of the group
 * @return {GroupResponse} - The updated group
 * @throws {403} - If user is not logged in
 * @throws {403} - If user is not owner of group with groupId
 * @throws {404} - If group not found
 * @throws {409} - If group already in use
 *
 */
router.put(
  "/:groupId?",
  [
    userValidator.isUserLoggedIn,
    groupValidator.isGroupOwner,
    groupValidator.doesGroupExist,
    groupValidator.isGroupNameNotAlreadyInUse,
  ],
  async (req: Request, res: Response) => {
    const group = await GroupCollection.updateOne(req.params.groupId, req.body);

    res.status(200).json({
      message: `Your group has been updated successfully`,
      group: util.constructGroupResponse(group),
    });
  }
);

/**
 * Delete an existing group
 *
 * @name DELETE /api/groups/:groupId
 *
 * @param {string} name - updated name of the group
 * @param {string} description - updated description of the group
 * @return {GroupResponse} - The updated group
 * @throws {403} - If user is not logged in
 * @throws {403} - If user is not owner of group with groupId
 * @throws {404} - If group not found
 *
 */
router.delete(
  "/:groupId?",
  [
    userValidator.isUserLoggedIn,
    groupValidator.isGroupOwner,
    groupValidator.doesGroupExist,
  ],
  async (req: Request, res: Response) => {
    const group = await GroupCollection.deleteOne(req.params.groupId);

    res.status(200).json({
      message: `Your group has been deleted successfully`,
    });
  }
);

/**
 * Get all groups
 *
 * @name GET /api/groups
 *
 * @return {GroupResponse[]} - an array of group information for all groups
 */
/**
 * Get group by Id
 *
 * @name GET /api/groups?groupId=ID
 *
 * @return {GroupResponse} - group information for group with corresponding Id
 * @throws {404} - If the group Id does not exist
 *
 */
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if groupId query parameter was supplied
    if (req.query.groupId !== undefined) {
      next();
      return;
    }
    const allGroups = await GroupCollection.findAll();
    const response = allGroups.map(util.constructGroupResponse);

    res.status(200).json(response);
  },
  [groupValidator.doesGroupExist],
  async (req: Request, res: Response) => {
    const group = await GroupCollection.findOneByGroupId(
      req.query.groupId as string
    );
    res.status(200).json(util.constructGroupResponse(group));
  }
);

/**
 * Get all groups that current user is a member of
 *
 * @name GET /api/groups/membership
 *
 * @return {GroupResponse[]} - group information for each group that the user is in
 * @throws {403} - If the user is not logged in
 *
 */
router.get(
  "/membership",
  [userValidator.isUserLoggedIn],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since its validated in isUserLoggedIn
    const groups = await GroupCollection.findAllWithUser(userId);
    const response = groups.map(util.constructGroupResponse);

    res.status(200).json(response);
  }
);
