import type { NextFunction, Request, Response } from "express";
import express from "express";
import GroupCollection, { Role } from "./collection";
import * as groupValidator from "../group/middleware";
import * as userValidator from "../user/middleware";
import * as freetValidator from "../freet/middleware";
import * as util from "./util";
import FreetCollection from "../freet/collection";

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
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since it's validated in isUserLoggedIn
    const group = await GroupCollection.createGroup(
      req.body.name,
      req.body.description,
      userId
    );

    res.status(201).json({
      message: `Your group has been created successfully`,
      group: util.constructGroupResponse(group),
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
  [groupValidator.doesGroupQueryExist],
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
 * @name GET /api/groups/member
 *
 * @return {GroupResponse[]} - group information for each group that the user is in
 * @throws {403} - If the user is not logged in
 *
 */
/**
 * Get all groups in which user is a member of and has corresponding role
 *
 * @name GET /api/groups/member?role=ROLE
 *
 * @return {GroupResponse} - An array of group details, with one entry for
 *                           every group in which the user has the corresponding role given in the query
 *
 * @throws {403} if the user is not logged in
 * @throws {400} if ROLE is not either 'member', 'moderator', or 'owner'
 *
 */
router.get(
  "/member",
  [userValidator.isUserLoggedIn],
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.role !== undefined) {
      next();
      return;
    }
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since it's validated in isUserLoggedIn
    const groups = await GroupCollection.findAllWithUser(userId);
    const response = groups.map(util.constructGroupResponse);

    res.status(200).json(response);
  },
  [groupValidator.isRoleValid],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since it's validated in isUserLoggedIn
    const groups = await GroupCollection.findAllWithUserRole(
      userId,
      req.query.role as Role
    );
    const response = groups.map(util.constructGroupResponse);

    res.status(200).json(response);
  }
);

/**
 * Join a group
 * 
 * @name POST /api/groups/:groupId/member
 * 
 * @return {GroupResponse} - the updated group information
 * 
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the group Id does not exist
 * @throws {409} - If the user is already a member of the group
 */
router.post(
  "/:groupId?/member",
  [userValidator.isUserLoggedIn, groupValidator.doesGroupParamExist, groupValidator.isUserNotInGroup],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since it's validated in isUserLoggedIn
    let group = await GroupCollection.findOneByGroupId(req.params.groupId);
    group = await GroupCollection.addUser(userId, group._id, "member");
    const response = util.constructGroupResponse(group);

    res.status(200).json(response);
  }
);

/**
 * Leave a group
 * 
 * @name DELETE /api/groups/:groupId/member
 * 
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the group Id does not exist
 * @throws {409} - If the user is not a member of the group
 */
router.delete(
  "/:groupId?/member",
  [userValidator.isUserLoggedIn, groupValidator.doesGroupParamExist, groupValidator.isUserInGroup],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since it's validated in isUserLoggedIn
    const group = await GroupCollection.findOneByGroupId(req.params.groupId);
    await GroupCollection.removeUserFromGroup(userId, group._id);

    res.status(200).json({message:"You've left the group successfully.'"});
  }
);

/**
 * Post a freet to a group
 * 
 * @name POST /api/groups/:groupId/freets
 * 
 * @return The updated group details of the group with name groupId
 * 
 * @param {string} content - The content of the freet 
 * 
 * @throws {403} - if the user is not logged in
 * @throws {403} - if the user is not in the group
 * @throws {404} - if the group Id does not exist
 * @throws {409} - If the user is not a member of the group
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
 router.post(
  "/:groupId?/freets",
  [userValidator.isUserLoggedIn, groupValidator.doesGroupParamExist, groupValidator.isUserInGroup, freetValidator.isValidFreetContent, userValidator.isCurrentSessionUserExists],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ""; // Will not be an empty string since it's validated in isUserLoggedIn
    let group = await GroupCollection.findOneByGroupId(req.params.groupId);
    const freet = await FreetCollection.addOne(userId, req.body.content);
    group = await GroupCollection.addFreet(freet._id, group._id);

    const response = util.constructGroupResponse(group);

    res.status(201).json(response);
  }
);

export { router as groupRouter };
