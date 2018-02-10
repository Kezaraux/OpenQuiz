function handleFileSelect() {
    var fileSelect = document.getElementById('file-select');
    var file = fileSelect.files[0];
    var fr = new FileReader();
    fr.onload = function() {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open('GET', fr.result, false);
        xmlhttp.send();
        var course = JSON.parse(xmlhttp.responseText);

        var req = {
            type   : 'addCourse',
            course : course
        };

        xmlhttp.open('POST', 'http://localhost:8000', false);
        xmlhttp.send(JSON.stringify(req));

        if (xmlhttp.responseText === 'OK'){
            alert('Added Course successfully!');
        } else {
            alert(xmlhttp.responseText);
        }
    };

    if (file !== undefined) {
        fr.readAsDataURL(file);
    } else {
        alert('Please select a valid file');
    }
}
