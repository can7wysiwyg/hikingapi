const Admin = require('../models/AdminModel')
const asyncHandler = require('express-async-handler')

const authAdmin = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id)

  if (!admin) {
    return res.status(404).json({ msg: 'Admin not found' })
  }

  if (admin.accountStatus === false) {
    return res.status(403).json({ msg: 'Account access is currently disabled' })
  }

  if (admin.admin !== 1) {
    return res.status(403).json({ msg: 'You are not an admin' })
  }

  next()
})

module.exports = authAdmin
