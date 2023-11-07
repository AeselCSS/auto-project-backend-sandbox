import express from "express";
import { startWorkflowInstance } from "../controllers/workflowInstance.controller.js";
const workflowInstanceRouter = express.Router();

workflowInstanceRouter.route('/workflowInstances/:id')
    .patch(startWorkflowInstance)

export default workflowInstanceRouter;