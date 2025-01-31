const express = require('express');
const authRequired = require('../middleware/authRequired');
// const ownerAuthorization = require('../middleware/ownerAuthorization'); needs to be refactored
const {
  roleAuthenticationInstructor,
} = require('../middleware/roleAuthentication');
const Courses = require('./coursesModel');
const router = express.Router();
const {
  checkCourseExists,
  validateCourseObject,
  checkInstructorExists,
} = require('./coursesMiddleware');

/**
 * @swagger
 * components:
 *  schemas:
 *    Courses:
 *      type: object
 *      required:
 *        - course_id
 *        - course_name
 *        - course_description
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
 *        course_id:
 *          type: integer
 *          description: This is the primary key auto-generated by the DB
 *        course_name:
 *          type: string
 *        course_description:
 *          type: string
 *        days_of_week:
 *          type: array
 *          description: What days of the week does the course fall on? ex. ['Monday', 'Friday']. Must be full day names, not abbreviations
 *        max_size:
 *          type: integer
 *          description: The maximum number of students that can register for this course
 *        min_age:
 *          type: integer
 *          description: No students younger than this age can register for the course
 *        max_age:
 *          type: integer
 *          description: No students older than this age can register for the course
 *        program_id:
 *          type: integer
 *          description: This is a foreign key that references what category of program this course is in
 *        instructor_id:
 *          type: integer
 *          description: This is a foreign key that references which instructor is teaching this course
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
 *          description: total number of course sessions which will be held during specified date range
 *      example:
 *        course_id: 1
 *        course_name: 'App Building Fundamentals'
 *        course_description: >
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
 * /course-instance(s):
 *  get:
 *   description: Returns a list of all courses
 *   security:
 *     - okta: []
 *   tags:
 *     - courses
 *   responses:
 *     200:
 *       description: array of courses
 *       content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Courses'
 *              example:
 *                - course_id: 1
 *                  course_name: 'App Building Fundamentals'
 *                  course_description: >
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
 *                - course_id: 2
 *                  course_name: 'Mindful Design'
 *                  course_description: 'Students will learn about creativity and web design basics'
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
 *     401:
 *       $ref: '#/components/responses/UnauthorizedError'
 *     403:
 *       $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/', authRequired, function (req, res, next) {
  Courses.getAllCourses()
    .then((scheduleList) => {
      res.status(200).json(scheduleList);
    })
    .catch(next);
});

/**
 * @swagger
 * components:
 *  parameters:
 *    course_id:
 *        name: course_id
 *        in: path
 *        description: ID of the course to return
 *        required: true
 *        example: 1
 *        schema:
 *         type: integer
 *
 * /course-instance/{course_id}:
 *  get:
 *   description: Returns a course object
 *   security:
 *     - okta: []
 *   tags:
 *     - courses
 *   parameters:
 *      - $ref: '#/components/parameters/course_id'
 *   responses:
 *     200:
 *       description: course object
 *       content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Courses'
 *              type: object
 *              items:
 *                $ref: '#/components/schemas/Courses'
 *              example:
 *                  course_id: 1
 *                  course_name: 'App Building Fundamentals'
 *                  course_description: >
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
 *     401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *     403:
 *         $ref: '#/components/responses/UnauthorizedError'
 *     404:
 *       description: 'Course Instance with id {course_id} does not exist'
 */

router.get('/:course_id', authRequired, checkCourseExists, function (req, res) {
  res.status(200).json(req.courses);
});

/**
 * @swagger
 * /course-instance:
 *  post:
 *   description: Returns a newly created course object
 *   security:
 *     - okta: []
 *   tags:
 *     - courses
 *   requestBody:
 *      description: Course object to be created
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Courses'
 *          example:
 *                  course_name: 'App Building Fundamentals'
 *                  course_description: >
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
 *   responses:
 *     200:
 *       description: course object
 *       content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Courses'
 *              type: object
 *              items:
 *                $ref: '#/components/schemas/Courses'
 *              example:
 *                  course_name: 'App Building Fundamentals'
 *                  course_description: >
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
 *     401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *     403:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post(
  '/',
  authRequired,
  roleAuthenticationInstructor,
  validateCourseObject,
  checkInstructorExists,
  async (req, res, next) => {
    const course = req.body;
    try {
      const inserted = await Courses.addCourse(course);
      res.status(200).json({
        message: 'New course added.',
        created_course: inserted,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 *  components:
 *  parameters:
 *    course_id:
 *        name: course_id
 *        in: path
 *        description: ID of the course to update
 *        required: true
 *        example: 1
 *        schema:
 *         type: integer
 *
 * /course-instance/{course_id}:
 *  put:
 *   description: Returns an updated course object
 *   security:
 *     - okta: []
 *   tags:
 *     - courses
 *   parameters:
 *     - $ref: '#/components/parameters/course_id'
 *   requestBody:
 *      description: Course object with updates
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Courses'
 *          example:
 *                  course_name: 'App Building Fundamentals'
 *                  course_description: >
 *                    A month-long course where students with design,
 *                    build, and deploy an app from beginning to end!
 *                  days_of_week:
 *                    - Monday
 *                  max_size: 25
 *                  min_age: 7
 *                  max_age: 12
 *                  instructor_id: 1
 *                  program_id: 1
 *                  start_time: '08:00:00'
 *                  end_time: '12:30:00'
 *                  start_date: '2022-04-04T04:00:00.000Z'
 *                  end_date: '2022-04-28T04:00:00.000Z'
 *                  location: 'Local Library'
 *                  number_of_sessions: 4
 *   responses:
 *     200:
 *       description: updated course object
 *       content:
 *          application/json:
 *              type: object
 *              example:
 *                  course_name: 'App Building Fundamentals'
 *                  course_description: >
 *                    A month-long course where students with design,
 *                    build, and deploy an app from beginning to end!
 *                  days_of_week:
 *                    - Monday
 *                  max_size: 25
 *                  min_age: 7
 *                  max_age: 12
 *                  instructor_id: 1
 *                  program_id: 1
 *                  start_time: '08:00:00'
 *                  end_time: '12:30:00'
 *                  start_date: '2022-04-04T04:00:00.000Z'
 *                  end_date: '2022-04-28T04:00:00.000Z'
 *                  location: 'Local Library'
 *                  number_of_sessions: 4
 *     401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *     403:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.put(
  '/:course_id',
  validateCourseObject,
  checkInstructorExists,
  authRequired,
  checkCourseExists,
  (req, res, next) => {
    const course_id = parseInt(req.params.course_id);
    const newCourseObject = req.body;

    Courses.updateCourse(course_id, newCourseObject)
      .then((updated) => {
        res.status(200).json({
          message: `Course instance with the course_id: ${course_id} updated`,
          course: updated,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * @swagger
 * /course_instance/{course_id}:
 *  delete:
 *    summary: Remove a course
 *    security:
 *      - okta: []
 *    tags:
 *      - courses
 *    parameters:
 *      - $ref: '#/components/parameters/course_id'
 *    responses:
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        $ref: '#/components/responses/NotFound'
 *      200:
 *        description: An object message about the deleted course
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: A message about the result
 *                  example: Course instances with id:'${course_id}' was deleted
 */

router.delete(
  '/:course_id',
  authRequired,
  checkCourseExists,
  (req, res, next) => {
    const course_id = parseInt(req.params.course_id);
    try {
      Courses.removeCourse(course_id).then(() => {
        res.status(200).json({
          message: `Course instance with id:'${course_id}' was deleted.`,
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
