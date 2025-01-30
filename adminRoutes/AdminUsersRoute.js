const AdminUsersRoute = require("express").Router();
const User = require("../models/UserModel");
const Driver = require("../models/DriverModel");
const verifyMainAdmin = require("../adminmiddleware/verifyMainAdmin");
const mainAdmin = require("../adminmiddleware/mainAdmin");
const asyncHandler = require("express-async-handler");

AdminUsersRoute.get(
  "/admin_show_all_users",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const users = await User.find().sort({ _id: -1 });

      res.json(users);
    } catch (error) {
      res.status(500).json({
        msg: `There was an error in getting the users: ${error.message}`,
      });
    }
  })
);

AdminUsersRoute.get(
  "/admin_show_user/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({ _id: id });

      res.json(user);
    } catch (error) {
      res.status(500).json({
        msg: `There was an error in getting the users: ${error.message}`,
      });
    }
  })
);

AdminUsersRoute.put(
  "/admin_change_user_account/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      await User.findByIdAndUpdate(id, req.body, { new: true });

      res.json({ msg: "action has been successful" });
    } catch (error) {
      res.json({ msg: `problem in changing user account` });
    }
  })
);

AdminUsersRoute.get(
  "/admin_view_driver_application/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const driver = await Driver.findOne({ driverName: id });


    if (!driver) {
      return res.json({ msg: "USER HAS NO DRIVER APPLICATION" });
    }


  
    res.json(driver);
  })
);

module.exports = AdminUsersRoute;
