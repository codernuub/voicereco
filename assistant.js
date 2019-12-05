const btn = document.getElementById("start");
const reply = document.getElementById("reply");
const recoError = document.getElementById("recoError");
const speechError = document.getElementById("speechError");

const rep = ['hi', 'ha mei or batao','bye', 'apna kaam karna'];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

btn.textContent = "activate";


recognition.onstart = function () {
    btn.textContent = "Listening...";
}

recognition.onresult = function (event) {

    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    btn.textContent = "activate";
    bolo(transcript);

}

recognition.onerror = function (event) {
   recoError.textContent = event.error;
}

btn.addEventListener('click', () => {

    recognition.start(); 

});
function bolo(message) {

    const speech = new SpeechSynthesisUtterance();

    speech.onerror = function (event) {

        speechError.textContent = event.error;
    }

    if (message.includes("hello")) {
    
        const rely = rep[Math.floor(Math.random() * rep.length)];
        //console.log(rely);
        speech.text = rely;
        reply.textContent = rely;
      
    }else{
        speech.text = "kiya bol rahe ho humko samajh nhi araha hai";
        reply.textContent = speech.text;
    }

   
    speech.volume = 2;
    speech.rate = 0.9;
    speech.pitch = 0.8;

    window.speechSynthesis.speak(speech);
}

