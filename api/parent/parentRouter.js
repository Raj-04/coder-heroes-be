const express = require('express');
const authRequired = require('../middleware/authRequired');
const {
  roleAuthenticationParent,
} = require('../middleware/roleAuthentication');
const { checkChildObject } = require('../children/childrenMiddleware');
const Parents = require('./parentModel');
const Children = require('../children/childrenModel');
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
  roleAuthenticationParent,
  checkChildObject,
  function (req, res) {
    const { parent_id } = req.params;
    Children.addChild({ ...req.body, parent_id })
      .then(([child]) => {
        res.status(201).json({ message: 'Child successfully added!', child });
      })
      .catch((err) => {
        console.log("add child didn't work");
        res.status(500).json({ error: err.message });
      });
  }
);

module.exports = router;
