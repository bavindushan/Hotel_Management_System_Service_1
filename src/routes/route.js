const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer.routes");
const travelCompanyRoutes = require("./travelCompany.routes");
const publicRoutes = require("./public.routes") 
const authRoutes = require("./auth.routes") 
const adminRoutes = require("./admin.routes") 
const clerkRoutes = require("./clerk.routes") 
const managerRoutes = require("./manager.routes") 

router.use("/customer", customerRoutes);
router.use("/travelCompany", travelCompanyRoutes);
router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/clerk", clerkRoutes);
router.use("/manager", managerRoutes);

module.exports = router;