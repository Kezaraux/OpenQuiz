const express       = require('express');
const cookieParser  = require('cookie-parser');
const cookieSession = require('cookie-session');
const app           = express();
const port          = 8000;

const adminUser = 'marcelrusu0@gmail.com'; // Enter admin email here

const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

app.use(cookieParser('OpenPass123'));
app.use(cookieSession({secret: 'OpenPass123'}));

// takes all POST requests
app.post(/^(.+)$/, function(req, res) {
    'use strict';
    var body = '';

    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        var parsedData = JSON.parse(body);
        if (parsedData) {
            switch (parsedData.type) {
            case 'login':
                req.session.userInfo = parsedData.userInfo;
                if (parsedData.userInfo.email === adminUser) {
                    req.session.userInfo.type = 'admin';
                } else {
                    req.session.userInfo.type = 'user';
                }
                addUser('user', parsedData.userInfo.email, res);
                break;
            case 'submitTest':
                submitTest(parsedData.test_id, parsedData.percentage, req.session.userInfo.email, parsedData.course_id, res);
                break;
            case 'addCourse':
                getCoursesCallback(function(courseArr) {
                    var isUnique = true;
                    courseArr.forEach(function(course) {
                        if (course.title === parsedData.course.title) {
                            isUnique = false;
                        }
                    });
                    if (isUnique) {
                        addCourse(parsedData.course);
                        res.send('OK');
                    } else {
                        res.status(409).send('There is already a course with that title');
                    }
                });
                break;
            case 'removeCourse':
                if (req.session.userInfo.type === 'admin') {
                    removeCourse(parsedData.courseTitle, res);
                } else {
                    res.status(403).send('Not admin')
                }
                break;
            case 'addCourseToUser':
                addCourseToUser(parsedData.email, parsedData.courseId, parsedData.courseTitle, res);
                break;
            case 'courseByTitle':
                getCourseByTitle(parsedData.courseTitle, res);
                break;
            case 'testsByCourseTitle':
                getTestsByCourseTitle(parsedData.courseTitle, res);
                break;
            case 'coursesByFilters':
                getCoursesByFilters(parsedData.filters, res);
                break;
            case 'testByCourseTitleAndTestName':
                getTestByCourseTitleAndTestName(parsedData.course_title, parsedData.test_title, res);
                break;
            case 'search':
                getCoursesThatStartWith(parsedData.search, res);
                break;
            dafault:
                res.send('No such request');
                break;
            }
        } else {
            res.send('Not a request');
        }
    });
});

// takes all GET requests
app.get(/^(.+)$/, function(req, res) {
    var url = req.params[0];

    if (req.session.userInfo === undefined) { // maybe want on front end
        if (url.indexOf('.') === -1 && req.url !== '/' && req.url !== '/about') {
            res.redirect('/');
        } else if (req.url === '/') {
            res.sendFile(__dirname + '/login.html');
        } else if (req.url === '/about') {
            res.sendFile(__dirname + '/about.html');
        } else {
            res.sendFile(__dirname + req.params[0]);
        }
    } else {
        if (url.indexOf('.') !== -1) { // handles all static content ex. GET calls for global.css, login.js etc.
            if (url === '/upload.html' && req.session.userInfo.type !== 'admin') {
                res.redirect('/403');
            } else {
                res.sendFile(__dirname + req.params[0]);
            }
        } else {
            switch(url) {
            case '/login':
            case '/':
                if (req.session.userInfo === undefined) {
                    res.sendFile(__dirname + '/login.html');
                } else {
                    res.sendFile(__dirname + '/landing.html');
                }
                break;
            case '/getProfileInfo':
                res.json(req.session.userInfo);
                break;
            case '/getUserType':
                if (req.session.userInfo.email === adminUser) {
                    res.send('admin');
                } else {
                    res.send('user');
                }
                break;
            case '/getUser':
                getUser(req.session.userInfo.email, res);
                break;
            case '/getCoursesByUser':
                getCoursesByUser(req.session.userInfo.email, res);
                break;
            case '/about':
                res.sendFile(__dirname + '/about.html');
                break;
            case '/landing':
                res.sendFile(__dirname + '/landing.html');
                break;
            case '/help':
                res.sendFile(__dirname + '/help.html');
                break;
            case '/catalogue':
                res.sendFile(__dirname + '/catalogue.html');
                break;
            case '/profile':
                res.sendFile(__dirname + '/profile.html');
                break;
            case '/about':
                res.sendFile(__dirname + '/about.html');
                break;
            case '/getFilters':
                getFilters(res);
                break;
            case '/logout':
                req.session.userInfo = undefined;
                delete req.session;
                res.redirect('/');
                break;
            case '/404':
                res.sendFile(__dirname + '/error.html');
                break;
            case '/403':
                res.sendFile(__dirname + '/forbidden.html');
                break;
            case '/getSessionStatus':
                res.send((req.session.userInfo.email === undefined).toString());
                break;
            case '/getUserEmail':
                res.send(req.session.userInfo.email);
                break;
            case '/getCourses':
                getCourses(res);
                break;
            case '/upload':
                if (req.session.userInfo.type === 'admin') {
                    res.sendFile(__dirname + '/upload.html');
                } else {
                    res.redirect('/403');
                }
                break;
            default:
                if (url.indexOf('/test/') !== -1) {
                    hasCourse(req.session.userInfo.email, url.substring(url.indexOf('/course/') + 8, url.indexOf('/test/')), function(userHasCourse) {
                        if (userHasCourse) {
                            res.sendFile(__dirname + '/test.html');
                        } else {
                            res.redirect('/403');
                        }
                    });
                } else if (url.indexOf('/course/') !== -1){
                    hasCourse(req.session.userInfo.email, url.substring(url.indexOf('/course/') + 8, url.length), function(userHasCourse) {
                        if (userHasCourse) {
                            res.sendFile(__dirname + '/courseView.html');
                        } else {
                            res.redirect('/403');
                        }
                    });
                } else {
                    res.redirect('/404');
                }
            }
        }
    }
});

// server listens at port (8000)
app.listen(port);

// MongoDB stuff
const Db     = require('mongodb').Db,
      Mongos = require('mongodb').Mongos,
      Server = require('mongodb').Server,
      assert = require('assert');

const server = new Server('localhost', 27021, {auto_reconnect: true});
const db = new Db('data', server);

// init code
db.open(function(err, p_db) {
    db.createCollection('users', function(err, r) {
        if (err) throw err;
    });
    db.createCollection('tests', function(err, r) {
        if (err) throw err;
    });
    db.createCollection('courses', function(err, r) {
        if (err) throw err;
    });
    getIds(function(_ids) { ids = _ids });
    addUser('admin', adminUser);
});

// Checks if a user has a course
function hasCourse(email, course_title, callback) {
    const users = db.collection('users');

    users.find().toArray(function(err, _users) {
        if (err) throw err;

        _users.every(function(user) {
            if (user.email === email) {
                callback(user.course_titles.indexOf(course_title) !== -1);
                return false;
            }
            return true;
        });
    });
}

function removeCourse(course_title, response) {
    const courses = db.collection('courses');

    courses.find().toArray(function(err, _courses) {
        if (err) throw err;

        _courses.every(function(course) {
            if (course.title === course_title) {
                courses.remove(course, function(err, result) {
                    if (err) throw err;
                    response.send('OK');
                });
                return false;
            }
            return true;
        });
    });
}

// returns courses that a user has
function getCoursesByUser(email, response) {
    const users = db.collection('users');

    users.find().toArray(function(err, _users) {
        if (err) throw err;

        _users.every(function(user) {
            if (user.email === email) {
                const courses = db.collection('courses');
                var userCourses = [];
                courses.find().toArray(function(err, _courses) {
                    if (err) throw err;

                    _courses.forEach(function(course) {
                        if (user.course_ids.indexOf(course.course_id) !== -1) {
                            userCourses.push(course);
                        }
                    });
                    response.json(userCourses);
                });
                return false;
            }
            return true;
        });
    });
}

// called when finished writing a test, sumbits the mark to the user object who wrote it
function submitTest(test_id, mark, email, course_id, response) {
    const users = db.collection('users');

    users.find().toArray(function(err, _users) {
        if (err) throw err;

        _users.every(function(user) {
            if (user.email === email) {
                var isTest = false;
                user.tests.forEach(function(test) {
                    if (test.test_id === test_id) {
                        test.marks.push(mark);
                        isTest = true;
                    }
                });
                if (!isTest) {
                    user.tests.push({
                        test_id   : test_id,
                        course_id : course_id,
                        marks     : [mark]
                    });
                }
                users.save(user, {w : 1}, function(err, result) {
                    if (err) throw err;

                    response.send('OK');
                });
                return false;
            }
            return true;
        })
    })
}

// retuns a course object given courseTitle and testName
function getTestByCourseTitleAndTestName(course_title, test_title, response) { // TODO: this is bad and unnessary I think remove if possible
    const courses = db.collection('courses');

    courses.find().toArray(function(err, _courses) {
        if (err) throw err;

        _courses.every(function(course) {
            if (course.title === course_title) {
                const tests = db.collection('tests');

                tests.find().toArray(function(err, _tests) {
                    if (err) throw err;

                    _tests.every(function(test) {
                        if (test.test_id === course.test_ids[test_title]) {
                            response.json(test);
                            return false;
                        }
                        return true;
                    });
                });
                return false;
            }
            return true;
        });
    });
}

// returns courses that start with text <String>
function getCoursesThatStartWith(text, response) {
    const courses = db.collection('courses');
    var coursesWith = [];

    courses.find().toArray(function(err, _courses) {
        if (err) throw err;

        _courses.forEach(function(course) {
            if (!(course.title.length < text.length)) {
                var courseTitleArr = course.title.split('');
                var textArr = text.split('');
                var isGood = true;
                for (var i = 0; i < text.length; i++) {
                    if (courseTitleArr[i].toLowerCase() !== textArr[i].toLowerCase()) {
                        isGood = false;
                        break;
                    }
                }
                if (isGood) {
                    coursesWith.push(course);
                }
            }
        });
        response.json(coursesWith);
    });
}

// returns the user <Object>
function getUser(email, response) {
    const users = db.collection('users');

    users.find().toArray(function(err, _users) {
        if (err) throw err;
        var isUser = false;

        _users.every(function(user) {
            if (user.email === email) {
                isUser = true;
                response.json(user);
                return false;
            }
            return true;
        });
        if (!isUser) {
            response.send('NO');
        }
    });
}

// adds user to the database
function addUser(type, email, response) {
    const users = db.collection('users');

    users.find().toArray(function(err, _users) {
        if (err) throw err;
        var isUser = false;

        _users.every(function(user) {
            if (user.email === email) {
                isUser = true;
                return false;
            }
            return true;
        });
        if (!isUser) {
            users.save({
                    type          : type,
                    user_id       : generateId(),
                    email         : email,
                    tests         : [],
                    course_titles : [],
                    course_ids    : [],
                }, function(err, result) {
                    if (err) throw err;
                    if (response) {
                        response.send('OK');
                    }
                });
        } else {
            if (response) {
                response.send('OK');
            }
        }
    });
}

// adds course to users library of courses
function addCourseToUser(email, course_id, course_title, response) {
    const users = db.collection('users');
    var user;
    var newUser;
    users.find().toArray(function(err, _users) {
        if (err) throw err;
        _users.every(function(_user) {
            if (_user.email === email) {
                if (_user.course_ids.indexOf(course_id) === -1) {
                    _user.course_ids.push(course_id);
                    _user.course_titles.push(course_title)
                    users.save(_user, {w : 1}, function(err, result) {
                        if (err) throw err;
                        response.send('OK');
                    });
                } else {
                    response.send('Course is already added');
                }
                return false;
            }
            return true;
        });
    });
}

// adds course to the database
function addCourse(course) {
    const courses = db.collection('courses');
    var testIds   = {};
    var courseId  = generateId();
    course.tests.forEach(function(test) {
        testIds[test.title] = generateId();
    });

    courses.insert({
        title       : course.title,
        course_id   : courseId,
        filters     : course.filters,
        test_ids    : testIds,
        description : course.description,
        difficulty  : course.difficulty,
        author      : course.author
    });

    const tests = db.collection('tests');
    course.tests.forEach(function(test) {
        tests.insert({
            course_title : test.course_title,
            title        : test.title,
            description  : test.description,
            course_title : course.title,
            course_id    : courseId,
            test_id      : testIds[test.title],
            questions    : test.questions,
            number       : test.testNumber
        });
    });
}

// returns all ids <[Number]> in the database
function getIds(callback) {
    var _ids = [];

    var courses = db.collection('courses');
    courses.find().toArray(function(err, _courses) {
        if (err) throw err;

        _courses.forEach(function(course) {
            _ids.push(course.course_id);
            for (var id in course.test_ids) {
                _ids.push(id);
            };
        });
    });

    const users = db.collection('users');
    users.find().toArray(function(err, _users) {
        if (err) throw err;

        _users.forEach(function(user) {
            _ids.push(user.user_id);
        });
    });

    callback(_ids);
}

// returns course <object> by course title
function getCourseByTitle(course_title, response) {
    const courses = db.collection('courses');
    var course;
    courses.find().toArray(function(err, courseArr) {
        if (err) throw err;

        courseArr.every(function(p_course) {
            if (p_course.title === course_title) {
                course = p_course;
                course.tests = [];
                const tests = db.collection('tests');
                tests.find().toArray(function(err, testArr) {
                    if (err) throw err;

                    testArr.forEach(function(p_test) {
                        if (p_test.course_title === course_title) {
                            course.tests.push(p_test);
                        }
                    });
                    response.json(course);
                });

                return false;
            }
            return true;
        });

    });
}

// returns all tests <[Object]> in a course by course title
function getTestsByCourseTitle(course_title, response) {
    const tests = db.collection('tests');
    var testsWithTitle = [];
    tests.find().toArray(function(err, testsArr) {
        if (err) throw err;

        testsArr.forEach(function(test) {
            if (test.course_title === course_title) {
                testsWithTitle.push(test);
            }
        });
        response.json(testsWithTitle);
    });
}

// returns all the filters <[string]>
function getFilters(response) {
    const courses = db.collection('courses');
    var filters = [];
    courses.find().toArray(function(err, coursesArr) {
        coursesArr.forEach(function(course) {
            course.filters.forEach(function(filter) {
                if (filters.indexOf(filter) === -1) {
                    filters.push(filter);
                }
            });
        });
        response.json(filters);
    });
}

// returns all courses in database
function getCourses(response) {
    const courses = db.collection('courses');

    courses.find().toArray(function(err, courseArr) {
        response.json(courseArr);
    });
}

// returns all courses in database for internal calls only
function getCoursesCallback(callback) {
    const courses = db.collection('courses');

    courses.find().toArray(function(err, courseArr) {
        if (err) throw err;
        callback(courseArr);
    });
}

var ids = [];

const chars = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B',
    'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
    'y', 'z'
];

// generates a 25 digit id <String>
function generateId() {
    const length = 25;
    var isUnqiue = false;
    var id = '';
    while (!isUnqiue) {
        for (var i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        if (ids.indexOf(id) === -1) {
            isUnqiue = true;
        }
    }
    return id;
}
