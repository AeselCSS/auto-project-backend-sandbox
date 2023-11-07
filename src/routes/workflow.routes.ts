import express from "express";
import { createWorkflow, createManyWorkflows, deleteWorkflow, deleteAllWorkflows, getAllWorkflows, getWorkflowById, updateWorkflow } from "../controllers/workflow.controller.js";
const workflowRouter = express.Router();

workflowRouter.route('/workflows')
    .get(getAllWorkflows)
    .post(createWorkflow)

workflowRouter.route('/workflows/many')
    .post(createManyWorkflows)
    .delete(deleteAllWorkflows)

workflowRouter.route('/workflows/:id')
    .get(getWorkflowById)
    .put(updateWorkflow)
    .delete(deleteWorkflow)


export default workflowRouter;