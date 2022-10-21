import type { NextFunction, Request, Response } from "express";
import express from "express";
import ModerationCollection from "./collection";
import * as groupValidator from "../group/middleware";
import * as userValidator from "../user/middleware";
import * as moderationValidator from "../moderation/middleware";
import * as util from "./util";

const router = express.Router();

/**
 * Get all moderators for one groupId. Returns list of userIds, one for each moderator of the group
 * 
 * @throws {400} if groupId is not given
 * @throws {403} if groupId does not exist
 */
router.get(
    "/groupId/:groupId",
    [groupValidator.doesGroupParamExist],
    async (req: Request, res: Response) => {
      const moderationArray = await ModerationCollection.findAllByGroup(req.params.groupId);

      const moderators = moderationArray.map((moderator) => moderator.userId);
  
      res.status(201).json({
        moderators: moderators
      });
    }
  );