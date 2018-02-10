(function() {
    var serverUrl = 'http://localhost:8000';
    var xmlhttp = new XMLHttpRequest();

    var filters = (function() {
        xmlhttp.open('GET', serverUrl + '/getFilters', false);
        xmlhttp.send();
        return JSON.parse(xmlhttp.responseText);
    })();

    var courses = (function() {
        xmlhttp.open('GET', serverUrl + '/getCourses', false);
        xmlhttp.send();
        return JSON.parse(xmlhttp.responseText);
    })();

    var email = (function() {
        xmlhttp.open('GET', serverUrl + '/getUserEmail', false);
        xmlhttp.send();
        return xmlhttp.responseText;
    })();

    var userType = (function() {
        xmlhttp.open('GET', serverUrl + '/getUserType', false);
        xmlhttp.send();
        return xmlhttp.responseText;
    })();

    var searchText = document.getElementById('searchText');
    var searchButton = document.getElementById('searchButton').addEventListener('click', function() {
        var searchRequest = {
            type   : 'search',
            search : searchText.value.toLowerCase()
        };
        xmlhttp.open('POST', serverUrl, false);
        xmlhttp.send(JSON.stringify(searchRequest));
        courses = JSON.parse(xmlhttp.responseText);
    });

    function getCoursesByFilters(filters) {
        var coursesWithFilters = [];

        if (filters.length === 0) {
            for (var i = 0; i < courses.length; i++) {
                coursesWithFilters.push(courses[i]);
            }
            return coursesWithFilters;
        }

        for (var j = 0; j < courses.length; j++) {
            for (var k = 0; k < courses[j].filters.length; k++) {
                if (filters.indexOf(courses[j].filters[k]) !== -1) {
                    coursesWithFilters.push(courses[j]);
                    break;
                }
            }
        }

        return coursesWithFilters;
    }

    var app = angular.module('CourseCatalogue', []);

    app.controller('Catalogue', function($scope) {
        this.filters = filters;
        this.selectedCourse = -1;
        this.selectedFilters = [];
        this.courses = getCoursesByFilters(this.selectedFilters);

        this.isAdmin = function() {
            return userType === 'admin';
        };

        this.isSelectedFilter = function(filter) {
            return this.selectedFilter === filter;
        };

        this.setSelectedCourse = function(index) {
            this.selectedCourse = index;
        };

        this.addCourse = function(_course) {
            var addCourseRequest = JSON.stringify({
                type        : 'addCourseToUser',
                email       : email,
                courseId    : _course.course_id,
                courseTitle : _course.title
            });

            xmlhttp.open('POST', serverUrl, false);
            xmlhttp.send(addCourseRequest);
            if (xmlhttp.responseText === 'OK'){
                alert('Course Added Successfully');
            }else{
                alert(xmlhttp.responseText);
            }
        };

        this.removeCourse = function(_course){
            var removeCourseRequest = JSON.stringify({
                type        : 'removeCourse',
                courseTitle : _course.title
            });
            xmlhttp.open('POST',serverUrl,false);
            xmlhttp.send(removeCourseRequest);
            if (xmlhttp.responseText === 'OK') {
                alert('Course Removed Successfully');
            } else {
                alert(xmlhttp.responseText);
            }
            window.location.href = 'http://localhost:8000/catalogue';
        }

        this.toggleSelectedFilter = function(filter) {
            if (this.selectedFilters.indexOf(filter) === -1) {
                this.selectedFilters.push(filter);
            } else {
                this.selectedFilters.splice(this.selectedFilters.indexOf(filter), 1);
            }
            this.courses = getCoursesByFilters(this.selectedFilters);
        };

        this.isSelectedCourse = function(index) {
            return this.selectedCourse === index;
        };

        this.update = function() {
            this.courses = getCoursesByFilters(this.selectedFilters);
        };

    });
})();
