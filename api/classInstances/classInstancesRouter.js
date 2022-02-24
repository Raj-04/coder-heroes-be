const express = require('express');
const authRequired = require('../middleware/authRequired');
const ownerAuthorization = require('../middleware/ownerAuthorization');
const {
  roleAuthentication,
  roles,
} = require('../middleware/roleAuthentication');
const Classes = require('./classInstancesModel');
const router = express.Router();
const {
  checkClassInstanceExist,
  checkClassInstanceObject,
} = require('./classInstanceMiddleware');

/**
 * @swagger
 * components:
 *  schemas:
 *    Classes:
 *      type: object
 *      required:
 *        - class_id
 *        - class_name
 *        - class_description
 *        - days_of_week
 *        - max_size
 *        - min_age
 *        - max_age
 *        - instructor_id
 *        - program_id
 *        - start_time
 *        - end_time
 *        - start_date
 *        - end_date
 *        - location
 *        - number_of_sessions
 *      properties:
 *        class_id:
 *          type: integer
 *          description: This is the primary key auto-generated by the DB
 *        class_name:
 *          type: string
 *        class_description:
 *          type: string
 *        days_of_week:
 *          type: array
 *          description: What days of the week does the class fall on? ex. ['Monday', 'Friday']. Must be full day names, not abbreviations
 *        max_size:
 *          type: integer
 *          description: The maximum number of students that can register for this class
 *        min_age:
 *          type: integer
 *          description: No students younger than this age can register for the class
 *        max_age:
 *          type: integer
 *          description: No students older than this age can register for the class
 *        program_id:
 *          type: integer
 *          description: This is a foreign key that references what category of program this class is in
 *        instructor_id:
 *          type: integer
 *          description: This is a foreign key that references which instructor is teaching this class
 *        start_time:
 *          type: time
 *          description: (Low value - 00:00:00, High Value - 24:00:00)
 *        end_time:
 *          type: time
 *          description: (Low value - 00:00:00, High Value - 24:00:00)
 *        start_date:
 *          type: date
 *          description: ex. 02/08/2022 (2022-08-02T04:00:00.000Z)
 *        end_date:
 *          type: date
 *          description: ex. 02/09/2022 (2022-09-02T04:00:00.000Z)
 *        location:
 *          type: string
 *        number_of_sessions:
 *          type: integer
 *          description: total number of class sessions which will be held during specified date range
 *      example:
 *        class_id: 1
 *        class_name: 'App Building Fundamentals'
 *        class_description: >
 *          A month-long course where students with design,
 *          build, and deploy an app from beginning to end!
 *        days_of_week:
 *          - Monday
 *          - Friday
 *        max_size: 20
 *        min_age: 7
 *        max_age: 12
 *        instructor_id: 1
 *        program_id: 1
 *        start_time: '08:00:00'
 *        end_time: '12:30:00'
 *        start_date: '2022-04-04T04:00:00.000Z'
 *        end_date: '2022-04-28T04:00:00.000Z'
 *        location: 'Childrens Coding Center'
 *        number_of_sessions: 4
 * /class-instance(s):
 *  get:
 *   description: Returns a list of all classes
 *   security:
 *     - okta: []
 *   tags:
 *     - classes
 *   responses:
 *     200:
 *       description: array of classes
 *       content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Classes'
 *              example:
 *                - class_id: 1
 *                  class_name: 'App Building Fundamentals'
 *                  class_description: >
 *                    A month-long course where students with design,
 *                    build, and deploy an app from beginning to end!
 *                  days_of_week:
 *                    - Monday
 *                  max_size: 20
 *                  min_age: 7
 *                  max_age: 12
 *                  instructor_id: 1
 *                  program_id: 1
 *                  start_time: '08:00:00'
 *                  end_time: '12:30:00'
 *                  start_date: '2022-04-04T04:00:00.000Z'
 *                  end_date: '2022-04-28T04:00:00.000Z'
 *                  location: 'Childrens Coding Center'
 *                  number_of_sessions: 4
 *                  program_name: 'Codercamp'
 *                - class_id: 2
 *                  class_name: 'Mindful Design'
 *                  class_description: 'Students will learn about creativity and web design basics'
 *                  days_of_week:
 *                   - Monday
 *                   - Friday
 *                  max_size: 12
 *                  min_age: 6
 *                  max_age: 10
 *                  instructor_id: 2
 *                  program_id: 3
 *                  start_time: '15:30:00'
 *                  end_time: '17:45:00'
 *                  start_date: '2022-04-04T04:00:00.000Z'
 *                  end_date: '2022-04-28T04:00:00.000Z'
 *                  location: 'Childrens Coding Center'
 *                  number_of_sessions: 8
 *                  program_name: 'Coderyoga'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/', authRequired, function (req, res, next) {
  Classes.getAllClassInstances()
    .then((scheduleList) => {
      res.status(200).json(scheduleList);
    })
    .catch(next);
});

router.get('/:class_id', authRequired, checkClassInstanceExist, function (
  req,
  res
) {
  res.status(200).json(req.class_instance);
});

//ROUTES BELOW NEED TO BE UPDATED BASED ON CHANGES TO CLASSES TABLE

router.post(
  '/',
  checkClassInstanceObject,
  roleAuthentication(...roles.slice(2)),
  async (req, res) => {
    const classInstance = req.body;
    try {
      await Classes.addClassInstance(classInstance).then((inserted) => {
        res.status(200).json({
          message: 'New Class Instance Added.',
          schedule: inserted[0],
        });
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: e.message });
    }
  }
);

router.put(
  '/:class_id',
  authRequired,
  checkClassInstanceExist,
  ownerAuthorization('class_instance'),
  (req, res, next) => {
    const class_id = req.params.class_id;
    const newClassObject = req.body;

    Classes.updateClassInstance(class_id, newClassObject)
      .then((updated) => {
        res.status(200).json({
          message: `Class instance with the class_id: ${class_id} updated`,
          class_instance: updated[0],
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.delete(
  '/:class_id',
  authRequired,
  checkClassInstanceExist,
  ownerAuthorization('class_instance'),
  (req, res, next) => {
    const class_id = req.params.class_id;
    try {
      Classes.removeClassInstance(class_id).then(() => {
        res.status(200).json({
          message: `Schedule with id:'${class_id}' was deleted.`,
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
