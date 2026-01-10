const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer.routes");
const travelCompanyRoutes = require("./travelCompany.routes");
const publicRoutes = require("./public.routes") 
const authRoutes = require("./auth.routes") 
const adminRoutes = require("./admin.routes") 

router.use("/customer", customerRoutes);
router.use("/travelCompany", travelCompanyRoutes);
router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;