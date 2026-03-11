var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles')

// GET all roles
router.get('/', async function (req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false })
        res.send(roles);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET role by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// GET all users by role ID
router.get('/:id/users', async function (req, res, next) {
    try {
        let roleId = req.params.id;
        // Check if role exists and is not deleted
        let role = await roleModel.findById(roleId);
        if (!role || role.isDeleted) {
            return res.status(404).send({ message: "ROLE NOT FOUND" });
        }

        // Find users with this role
        let userModel = require('../schemas/users');
        let users = await userModel.find({ role: roleId, isDeleted: false });
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// POST (Create) a role
router.post('/', async function (req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        })
        await newRole.save();
        res.status(201).send(newRole)
    } catch (error) {
        res.status(400).send(error);
    }
})

// PUT (Update) a role
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            req.body,
            { new: true }
        )
        if (!result) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

// DELETE (Soft delete) a role
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            result.isDeleted = true;
            await result.save();
            res.send({ success: true, message: "Role deleted successfully", data: result });
        }
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
})

module.exports = router;
