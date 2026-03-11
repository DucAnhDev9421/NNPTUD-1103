var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')

// GET all users
router.get('/', async function (req, res, next) {
  try {
    let users = await userModel.find({ isDeleted: false }).populate('role');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET user by ID
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id).populate('role');
    if (!result || result.isDeleted) {
      res.status(404).send({ message: "ID NOT FOUND" });
    } else {
      res.send(result)
    }
  } catch (error) {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

// POST (Create) a user
router.post('/', async function (req, res, next) {
  try {
    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount || 0
    })
    await newUser.save();
    res.status(201).send(newUser)
  } catch (error) {
    res.status(400).send(error);
  }
})

// PUT (Update) a user
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true }
    ).populate('role')
    if (!result) {
      res.status(404).send({ message: "ID NOT FOUND" });
    } else {
      res.send(result)
    }
  } catch (error) {
    res.status(400).send(error)
  }
})

// DELETE (Soft delete) a user
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id);
    if (!result || result.isDeleted) {
      res.status(404).send({ message: "ID NOT FOUND" });
    } else {
      result.isDeleted = true;
      await result.save();
      res.send({ success: true, message: "User deleted successfully", data: result });
    }
  } catch (error) {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
})

// POST (Enable user)
router.post('/enable', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    let user = await userModel.findOne({ email, username, isDeleted: false });
    if (!user) {
      return res.status(400).send({ message: "Username hoặc Email không chính xác" });
    }

    user.status = true;
    await user.save();
    res.send({ success: true, message: "Kích hoạt tài khoản thành công", data: user });
  } catch (error) {
    res.status(500).send(error);
  }
})

// POST (Disable user)
router.post('/disable', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    let user = await userModel.findOne({ email, username, isDeleted: false });
    if (!user) {
      return res.status(400).send({ message: "Username hoặc Email không chính xác" });
    }

    user.status = false;
    await user.save();
    res.send({ success: true, message: "Vô hiệu hóa tài khoản thành công", data: user });
  } catch (error) {
    res.status(500).send(error);
  }
})

module.exports = router;
