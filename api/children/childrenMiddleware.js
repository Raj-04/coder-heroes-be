const Children = require('./childrenModel');
const checkChildExist = async (req, res, next) => {
  const id = req.params.id;
  const foundChild = await Children.findByChildId(id);
  if (!foundChild) {
    next({ status: 404, message: `child with id ${id} is not found ` });
  } else {
    req.child = foundChild;
    next();
  }
};

const isChildAlreadyEnrolled = async (req, res, next) => {
  const id = req.params.id;
  const { course_id } = req.body;
  const enrolledCourses = await Children.getEnrolledCourses(id);
  const childIsEnrolled = enrolledCourses.find((item) => {
    if (course_id == item.course_id) {
      return true;
    }
  });
  if (childIsEnrolled) {
    next({ status: 400, message: 'child is already enrolled' });
  } else {
    req.wantToEnroll = { child_id: id, ...req.body, course_id: course_id };

    console.log(req.wantToEnroll);
    next();
  }
};

const checkChildObject = async (req, res, next) => {
  const { name, username, age, avatarUrl } = req.body;
  if (!name) res.status(400).json({ status: 400, message: 'name is required' });
  if (!username)
    res.status(400).json({ status: 400, message: 'username is required' });
  if (!age) res.status(400).json({ status: 400, message: 'age is required' });

  if (typeof name !== 'string') {
    res.status(400).json({ status: 400, message: 'name must be a string' });
  }

  if (typeof username !== 'string') {
    res.status(400).json({ status: 400, message: 'username must be a string' });
  }

  if (typeof age !== 'number') {
    res.status(400).json({ status: 400, message: 'age must be a number' });
  }

  if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.length > 255) {
    req.body.avatarUrl = null;
  }

  next();
};

module.exports = {
  checkChildExist,
  isChildAlreadyEnrolled,
  checkChildObject,
};
