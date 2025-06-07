const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer.routes");
const travelCompanyRoutes = require("./travelCompany.routes");

router.use("/customer", customerRoutes);
router.use("/travelCompany", travelCompanyRoutes);


module.exports = router;