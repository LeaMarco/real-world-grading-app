import Hapi from '@hapi/hapi'
import Joi from '@hapi/joi'
import Boom from '@hapi/boom'

const coursesPlugin = {
  name: 'app/courses',
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/courses/{courseId}',
        handler: getCourseHandler,
        options: {
          validate: {
            params: Joi.object({
              courseId: Joi.number().integer(),
            }),
            failAction: (request, h, err) => {
              // show validation errors to user https://github.com/hapijs/hapi/issues/3706
              throw err
            },
          },
        },
      },
      {
        method: 'GET',
        path: '/courses',
        handler: getCoursesHandler,
      },
      {
        method: 'POST',
        path: '/courses',
        handler: createCourseHandler,
        options: {
          validate: {
            payload: createCourseValidator,
            failAction: (request, h, err) => {
              // show validation errors to user https://github.com/hapijs/hapi/issues/3706
              throw err
            },
          },
        },
      },
      {
        method: 'PUT',
        path: '/courses/{courseId}',
        handler: updateCourseHandler,
        options: {
          validate: {
            params: Joi.object({
              courseId: Joi.number().integer(),
            }),
            payload: updateCourseValidator,
            failAction: (request, h, err) => {
              // show validation errors to user https://github.com/hapijs/hapi/issues/3706
              throw err
            },
          },
        },
      },
      {
        method: 'DELETE',
        path: '/courses/{courseId}',
        handler: deleteCourseHandler,
        options: {
          validate: {
            params: Joi.object({
              courseId: Joi.number().integer(),
            }),
            failAction: (request, h, err) => {
              // show validation errors to user https://github.com/hapijs/hapi/issues/3706
              throw err
            },
          },
        },
      },
    ])
  },
}

export default coursesPlugin

const courseInputValidator = Joi.object({
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  courseDetails: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
})

const createCourseValidator = courseInputValidator.tailor('create')
const updateCourseValidator = courseInputValidator.tailor('update')

interface CourseInput {
  name: string
  courseDetails: string
}

async function getCourseHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app
  const courseId = parseInt(request.params.courseId, 10)

  try {
    const course = await prisma.course.findOne({
      where: {
        id: courseId,
      },
      include: {
        tests: true,
      },
    })
    if (!course) {
      return h.response().code(404)
    } else {
      return h.response(course).code(200)
    }
  } catch (err) {
    console.log(err)
    return Boom.badImplementation('failed to get course')
  }
}

async function getCoursesHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  try {
    const courses = await prisma.course.findMany({
      include: {
        tests: true,
      },
    })
    return h.response(courses).code(200)
  } catch (err) {
    console.log(err)
    return Boom.badImplementation('failed to get course')
  }
}

async function createCourseHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app
  const payload = request.payload as CourseInput

  try {
    const createdCourse = await prisma.course.create({
      data: {
        name: payload.name,
        courseDetails: payload.courseDetails,
      },
    })
    return h.response(createdCourse).code(201)
  } catch (err) {
    console.log(err)
    return Boom.badImplementation('failed to create course')
  }
}

async function updateCourseHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app
  const courseId = parseInt(request.params.courseId, 10)
  const payload = request.payload as Partial<CourseInput>

  try {
    const updatedUser = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: payload,
    })
    return h.response(updatedUser).code(200)
  } catch (err) {
    console.log(err)
    return Boom.badImplementation('failed to update course')
  }
}

async function deleteCourseHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app
  const courseId = parseInt(request.params.courseId, 10)

  try {
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    })
    return h.response().code(204)
  } catch (err) {
    console.log(err)
    return Boom.badImplementation('failed to delete course')
  }
}
