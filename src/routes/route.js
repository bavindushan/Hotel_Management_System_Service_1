const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer.routes");
const travelCompanyRoutes = require("./travelCompany.routes");
const publicRoutes = require("./public.routes") 

router.use("/customer", customerRoutes);
router.use("/travelCompany", travelCompanyRoutes);
router.use("/public", publicRoutes);

module.exports = router;