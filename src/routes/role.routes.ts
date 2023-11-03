import express from "express";

import { createRole, getAllRoles, getRoleById } from "../controllers/role.controller.js";

const roleRouter = express.Router();
roleRouter.route('/roles')
    .get(getAllRoles)
    .post(createRole)

roleRouter.route('/roles/:id')
    .get(getRoleById)


export default roleRouter;