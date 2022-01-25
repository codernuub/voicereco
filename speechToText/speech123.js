/*global webkitSpeechRecognition */
(function () {
	'use strict';
	const status = document.querySelector('.status');
	function consoleResult(transcript) {
		const span = document.createElement('span');
		span.innerHTML = `${transcript}<br/>`;
		status.appendChild(span);
	}
	try {
		// check for support (webkit only)
		if (!('webkitSpeechRecognition' in window)) return;
		var talkMsg = 'Speak now';
		// seconds to wait for more input after last
		var defaultPatienceThreshold = 10;

		function capitalize(str) {
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		function updateNewLinePair(str) {
			var tempPair = "", wordList = [];
			str.split(' ').forEach((word) => {

				if (word.toLowerCase() === "newline") {
					word = `${word}\n`;
					wordList.push(word);
					return;
				}

				if (tempPair && word.toLowerCase() === "new") {
					wordList.push(tempPair);
					tempPair = word;
					return;
				}

				if (!tempPair && word.toLowerCase() === "new") {
					tempPair = "new";
					return;
				}

				//Match the first pair with second pair
				if (tempPair.toLocaleLowerCase() === "new" && (word.toLowerCase() === "line")) {
					wordList.push(`${tempPair} ${word}\n`);
					tempPair = "";
					return;
				}

				//Appending word in new list
				if (!tempPair) wordList.push(word);
			});
			return wordList.join(' ');
		}

		var inputEls = document.getElementsByClassName('speech-input');

		[].forEach.call(inputEls, function (inputEl) {
			var patience = /*parseInt(inputEl.dataset.patience, 10) ||*/ defaultPatienceThreshold;
			var micBtn, micIcon, holderIcon, newWrapper;
			var shouldCapitalize = true;

			// gather inputEl data
			var nextNode = inputEl.nextSibling;
			var parent = inputEl.parentNode;
			var inputRightBorder = parseInt(getComputedStyle(inputEl).borderRightWidth, 10);
			var buttonSize = 0.8 * (inputEl.dataset.buttonsize || inputEl.offsetHeight);

			// default max size for textareas
			if (!inputEl.dataset.buttonsize && inputEl.tagName === 'TEXTAREA' && buttonSize > 26) {
				buttonSize = 26;
			}

			// create wrapper if not present
			var wrapper = inputEl.parentNode;
			if (!wrapper.classList.contains('si-wrapper')) {
				wrapper = document.createElement('div');
				wrapper.classList.add('si-wrapper');
				wrapper.appendChild(parent.removeChild(inputEl));
				newWrapper = true;
			}

			// create mic button if not present
			micBtn = wrapper.querySelector('.si-btn');
			if (!micBtn) {
				micBtn = document.createElement('button');
				micBtn.type = 'button';
				micBtn.classList.add('si-btn');
				micBtn.textContent = 'speech input';
				micIcon = document.createElement('span');
				holderIcon = document.createElement('span');
				micIcon.classList.add('si-mic');
				holderIcon.classList.add('si-holder');
				micBtn.appendChild(micIcon);
				micBtn.appendChild(holderIcon);
				wrapper.appendChild(micBtn);

				// size and position mic and input
				micBtn.style.cursor = 'pointer';
				micBtn.style.top = 0.125 * buttonSize + 'px';
				micBtn.style.height = micBtn.style.width = buttonSize + 'px';
				inputEl.style.paddingRight = buttonSize - inputRightBorder + 'px';
			}

			// append wrapper where input was
			if (newWrapper) parent.insertBefore(wrapper, nextNode);

			// setup recognition
			var prefix = '';
			var isSentence;
			var recognizing = false;
			var timeout;
			var oldPlaceholder = null;
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			var recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			console.log(recognition);

			// if lang attribute is set on field use that
			// (defaults to use the lang of the root element)
			if (inputEl.lang) recognition.lang = inputEl.lang;

			function restartTimer() {
				timeout = setTimeout(function () {
					recognition.stop();
				}, patience * 1000);
			}

			recognition.onstart = function () {
				console.log("Started");
				oldPlaceholder = inputEl.placeholder;
				inputEl.placeholder = inputEl.dataset.ready || talkMsg;
				recognizing = true;
				micBtn.classList.add('listening');
				restartTimer();
			};

			recognition.onend = function () {
				console.log("Ended")
				recognizing = false;
				clearTimeout(timeout);
				micBtn.classList.remove('listening');
				if (oldPlaceholder !== null) inputEl.placeholder = oldPlaceholder;

				// If the <input> has data-instant-submit and a value,
				if (inputEl.dataset.instantSubmit !== undefined && inputEl.value) {
					// submit the form it's in (if it is in one).
					if (inputEl.form) inputEl.form.submit();
				}
			};

			recognition.onresult = function (event) {
				clearTimeout(timeout);
				//get SpeechRecognitionResultList object
				var resultList = event.results;
				// go through each SpeechRecognitionResult object in the list
				var finalTranscript = '';
				var interimTranscript = '';
				for (var i = event.resultIndex; i < resultList.length; ++i) {
					var result = resultList[i];
					// get this result's first SpeechRecognitionAlternative object
					var firstAlternative = result[0];
					if (result.isFinal) {
						finalTranscript = firstAlternative.transcript;
					} else {
						interimTranscript += firstAlternative.transcript;
					}
				}

				// capitalize transcript if start of new sentence
				//consoleResult(`finalTranscript", ${finalTranscript}`);
				//consoleResult(`InterimTranscript", ${interimTranscript}`);
				var transcript = finalTranscript || interimTranscript;
				//var transcript = event.results[0][0].transcript;
				transcript = !prefix || isSentence ? capitalize(transcript) : transcript;

				//Check new line word and append new line char
				transcript = updateNewLinePair(transcript);
				// append transcript to cached input value
				inputEl.value = prefix + transcript;
				// set cursur and scroll to end
				inputEl.focus();
				if (inputEl.tagName === 'INPUT') {
					inputEl.scrollLeft = inputEl.scrollWidth;
				} else {
					inputEl.scrollTop = inputEl.scrollHeight;
				}

				restartTimer();
			};

			micBtn.addEventListener('click', function (event) {
				event.preventDefault();
				console.log("Recognizing!", recognizing);
				// stop and exit if already going
				if (recognizing) {
					recognition.stop();
					return;
				}

				// Cache current input value which the new transcript will be appended to
				var endsWithWhitespace = inputEl.value.slice(-1).match(/\s/);
				var endsWithNewLine = inputEl.value.slice(-1).match(/\n/);
				prefix = !inputEl.value || endsWithWhitespace || endsWithNewLine ? inputEl.value : inputEl.value + ' ';
				// check if value ends with a sentence
				isSentence = prefix.trim().slice(-1).match(/[\.\?\!]/);
				// restart recognition
				recognition.start();
			}, false);
		});
	} catch (err) {
		consoleResult(err.message);
	}
})();