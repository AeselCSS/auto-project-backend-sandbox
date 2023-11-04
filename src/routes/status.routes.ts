import express from "express";
import {createStatus, getAllStatuses, getStatusById} from "../controllers/status.controller.js";

const statusRouter = express.Router();
statusRouter.route('/statuses')
    .get(getAllStatuses)
    .post(createStatus)

statusRouter.route('/statuses/:id')
    .get(getStatusById)


export default statusRouter;