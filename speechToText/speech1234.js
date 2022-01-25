// var final_transcript = '';
var final_transcript = final_span.innerHTML + ' ';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var recognition;

(function () {

    if (!('webkitSpeechRecognition' in window)) {
        upgrade();
    } else {
        showInfo('start');
        start_button.style.display = 'inline-block';
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = function () {
            recognizing = true;
            showInfo('speak_now');
            start_img.src = 'images/mic-animation.gif';
        };

        recognition.onerror = function (event) {
            if (event.error == 'no-speech') {
                start_img.src = 'images/mic.gif';
                showInfo('no_speech');
                ignore_onend = true;
            }
            if (event.error == 'audio-capture') {
                start_img.src = 'images/mic.gif';
                showInfo('no_microphone');
                ignore_onend = true;
            }
            if (event.error == 'not-allowed') {
                if (event.timeStamp - start_timestamp < 100) {
                    showInfo('blocked');
                } else {
                    showInfo('denied');
                }
                ignore_onend = true;
            }
        };

        recognition.onend = function () {
            recognizing = false;
            if (ignore_onend) {
                return;
            }
            start_img.src = 'images/mic.gif';
            if (!final_transcript) {
                showInfo('start');
                return;
            }
            showInfo('stop');
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
                var range = document.createRange();
                range.selectNode(document.getElementById('final_span'));
                // window.getSelection().addRange(range);
            }
        };

        recognition.onresult = function (event) {
            var interim_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            final_transcript = capitalize(final_transcript);
            final_span.innerHTML = linebreak(final_transcript);
            interim_span.innerHTML = linebreak(interim_transcript);
        };
    }
});


$("#start_button").click(function () {
    if (recognizing) {
        recognition.stop();
        return;
    }
    // final_transcript = '';
    final_transcript = final_span.innerHTML + ' ';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    // final_span.innerHTML = '';
    interim_span.innerHTML = '';
    // final_span.innerHTML = s.replace('new line', '<p></p>'); // replace new line word phrase
    // final_span.innerHTML = s.replace('New line', '<p></p>'); // replace new line word phrase
    // final_span.innerHTML = s.replace('line break', '<p></p>'); // replace new line word phrase
    start_img.src = 'images/mic-slash.gif';
    showInfo('allow');
    start_timestamp = event.timeStamp;
});