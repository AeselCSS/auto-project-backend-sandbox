import express from 'express';
import { createCustomer, getAllCustomers, getCustomerById } from '../controllers/customer.controller.js';
const customerRouter = express.Router();

customerRouter.route("/customers")
    .get(getAllCustomers)
    .post(createCustomer);

customerRouter.route("/customers/:id")
    .get(getCustomerById);

export default customerRouter;