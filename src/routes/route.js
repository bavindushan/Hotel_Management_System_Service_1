const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer.routes");


router.use("/customer", customerRoutes);


module.exports = router;