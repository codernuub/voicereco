const transcript = "Hello new line hello hello newLine NEWLINE newline whadsjkdfsnewline Hello New";

function updateNewLinePair(str) {
    var tempPair = "", wordList = [];
    str.split(' ').forEach((word, index) => {

        if (word.toLowerCase() === "newline") {
            word = `${word}\n`;
            wordList.push(word);
            return;
        }

        //Push previous value in wordList when tempPair and word = new
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

console.log(updateNewLinePair(transcript));