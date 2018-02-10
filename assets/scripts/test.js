var numQuestions;

(function() {
    var url = window.location.href;

    var courseName = url.substring(url.indexOf('/course/') + 8, url.indexOf('/test/'));
    while (courseName.indexOf('%20') !== -1) courseName = courseName.replace('%20', ' ');

    var testName = url.substring(url.indexOf('/test/') + 6, url.length).replace('%20', ' ');
    while (testName.indexOf('%20') !== -1) testName = testName.replace('%20', ' ');

    var serverUrl = 'http://localhost:8000';
    var xmlhttp = new XMLHttpRequest();

    var test = (function() {
        var testDescriptionsResquest = JSON.stringify({
            type         : 'testByCourseTitleAndTestName',
            course_title : courseName,
            test_title   : testName
        });

        xmlhttp.open('POST', serverUrl, false);
        xmlhttp.send(testDescriptionsResquest);
        if (xmlhttp.status === 200) {
            return JSON.parse(xmlhttp.responseText);
        }
    })();

    var userType = (function() {
        xmlhttp.open('GET', serverUrl + '/getUserType', false);
        xmlhttp.send();
        if (xmlhttp.status === 200) {
            return xmlhttp.responseText;
        }
    })();

    numQuestions = test.questions.length;
    var newQuestions = [];
    var usedIndexes = [];
    var randomIndex = Math.floor(Math.random() * numQuestions);
    for (var i = 0; i < numQuestions; i++) {
        while (usedIndexes.indexOf(randomIndex) !== -1) {
            randomIndex = Math.floor(Math.random() * numQuestions);
        }
        usedIndexes.push(randomIndex);
        newQuestions.push(test.questions[randomIndex]);
    }
    test.questions = newQuestions;

    var app = angular.module('Test', []);

    app.controller('Tests', ['$scope' ,function($scope) {
        this.log = function(text) {
            console.log(text);
        };

        this.test = test;

        this.finished = false;

        this.questionAnswers = [];

	this.isAdmin = function() {
	    return userType === 'admin';
	};

        this.checkFlagged = function() {
            if (flagged.indexOf(true) === -1) {
                this.finished = true;
                $('.resultModal').modal('show');
            } else {
                if (confirm('You\'ve left some flagged questions, do you want to finish the test?') === true) {
                    this.finished = true;
                    $('.resultModal').modal('show');
                }
            }
        };
        this.finishTest = function() {
            var submitTest = JSON.stringify({
                type       : 'submitTest',
                test_id    : this.test.test_id,
                course_id  : this.test.course_id,
                percentage : Math.floor((this.getTotalCorrect()/this.questionAnswers.length) * 100)
            });

            xmlhttp.open('POST', serverUrl, false);
            xmlhttp.send(submitTest);
            window.location.href = serverUrl + '/course/' + courseName;
        };
        this.checkAnswer = function(q, a) {
            if (this.finished) {
                if (this.test.questions[q].choices[a] === this.test.questions[q].choices[this.test.questions[q].answer]) {
                    this.questionAnswers[q] = true;
                    return true;
                }
                this.questionAnswers[q] = false;
                return false ;
            }
        };
        this.getTotalCorrect = function() {
            var correct = 0;
            for (var i = 0; i < this.questionAnswers.length; i++) {
                if (this.questionAnswers[i] === true) {
                    correct += 1;
                }
            }
            return correct;
        };
        this.getChecked = function(q) {
            if (this.finished) {
                return $('input[name=answer' + q + ']:checked').val();
            }
        };
    }]);
})();

var flagged = [];
for (var i = 0; i < numQuestions; i++) {
    flagged.push(false);
}
