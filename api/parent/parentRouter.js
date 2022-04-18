const express = require('express');
const authRequired = require('../middleware/authRequired');
const { checkChildObject } = require('../children/childrenMiddleware');
const { create } = require('../profile/profileModel');
const Parents = require('./parentModel');
const { addChild } = require('../children/childrenModel');
const router = express.Router();

router.get('/:profile_id/children', authRequired, function (req, res) {
  const id = req.params.profile_id;

  Parents.getParentChildren(id)
    .then((children) => {
      if (children) {
        res.status(200).json(children);
      } else {
        res.status(404).json({ error: 'ParentChildrenNotFound' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get('/:profile_id/schedules', authRequired, function (req, res) {
  const { profile_id } = req.params;
  Parents.getChildSchedules(profile_id)
    .then((schedules) => {
      if (schedules) {
        res.status(200).json(schedules);
      } else {
        res.status(404).json({ error: 'ChildSchedulesNotFound' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.post(
  '/:parent_id/children',
  authRequired,
  checkChildObject,
  async (req, res) => {
    //Make profile with the name and role_id: 5
    const { parent_id } = req.params;
    try {
      const { profile_id } = await create({ name: req.body.name, role_id: 5 });
      const child = await addChild({
        profile_id,
        username: req.body.username,
        age: req.body.age,
        parent_id,
      });

      res.status(201).json(child);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
