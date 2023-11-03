import express from 'express';
import { createCustomer } from '../controllers/customer.controller.js';
const customerRouter = express.Router();

customerRouter.route("/customers")
    .get()
    .post(createCustomer);


export default customerRouter;