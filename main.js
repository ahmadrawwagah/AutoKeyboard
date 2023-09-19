//amc is ahmadmusiccode, the extra portion of the assignment

document.addEventListener("DOMContentLoaded", function (event) {
    const exampleSong =`120
F#4,D4,B3,1/8
R,1/8
A4,F#4,1/8
C#5,A4,1/8
R,1/8
A4,F#4,1/8
R,1/8
F#4,D4,1/8
D4,G#3,1/8
D4,G#3,1/8
D4,G#3,1/8
R,1/2
C#4,F3,1/8
D4,B3,F3,1/8
F#4,D4,1/8
A4,F#4,1/8
C#5,A4,1/8
R,1/8
A4,F#4,1/8
R,1/8
F#4,D4,1/8
E5,G#4,E3,G#3,3/8
D#5,G4,D#3,G3,1/8
D5,F#4,D3,F#3,1/8`
    //sample song written in amc

    const sineButton = document.querySelector('#sine');
    const sawtoothButton = document.querySelector('#sawtooth');
    const triangleButton = document.querySelector('#triangle');
    const squareButton = document.querySelector('#square');
    const uploadPlay = document.querySelector('#play');
    const uploadExample = document.querySelector('#example');

    var waveform = "sine"; //default waveform

    var fileContent;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
    globalGain.connect(audioCtx.destination);

    const attack = 0.2;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //extra octave added to support amc
    const keyboardFrequencyMap = {
        '1': 130.81, // C3
        '2': 138.59, // C#3
        '3': 146.83, // D3
        '4': 155.56, // D#3
        '5': 164.81, // E3
        '6': 174.61, // F3
        '7': 185.00, // F#3
        '8': 196.00, // G3
        '9': 207.65, // G#3
        '10': 220.00, // A3
        '11': 233.08, // A#3
        '12': 246.94, // B3
        '90': 261.625565300598634,  //Z - C4
        '83': 277.182630976872096, //S - C#4
        '88': 293.664767917407560,  //X - D4
        '68': 311.126983722080910, //D - D#4
        '67': 329.627556912869929,  //C - E4
        '86': 349.228231433003884,  //V - F4
        '71': 369.994422711634398, //G - F#4
        '66': 391.995435981749294,  //B - G4
        '72': 415.304697579945138, //H - G#4
        '78': 440.000000000000000,  //N - A4
        '74': 466.163761518089916, //J - A#4
        '77': 493.883301256124111,  //M - B4
        '81': 523.251130601197269,  //Q - C5
        '50': 554.365261953744192, //2 - C#5
        '87': 587.329535834815120,  //W - D5
        '51': 622.253967444161821, //3 - D#5
        '69': 659.255113825739859,  //E - E5
        '82': 698.456462866007768,  //R - F5
        '53': 739.988845423268797, //5 - F#5
        '84': 783.990871963498588,  //T - G5
        '54': 830.609395159890277, //6 - G#5
        '89': 880.000000000000000,  //Y - A5
        '55': 932.327523036179832, //7 - A#5
        '85': 987.766602512248223,  //U - B5
    }
    const beatMap = {
        "1/32": 0.125,
        "1/16": 0.25,
        "1/8": 0.5,
        "3/16": 0.75,
        "1/4": 1,
        "3/8": 1.5,
        "1/2": 2,
        "3/4": 3,
        "1": 4,
    }

    const noteIndexMap = {
        "C3": '1', // C3
        "C#3": '2', // C#3
        "D3": '3', // D3
        "D#3": '4', // D#3
        "E3": '5', // E3
        "F3": '6', // F3
        "F#3": '7', // F#3
        "G3": '8', // G3
        "G#3": '9', // G#3
        "A3": '10', // A3
        "A#3": '11', // A#3
        "B3": '12', // B3
        "C4": '90',  //Z - C4
        "C#4": '83', //S - C#4
        "D4": '88',  //X - D4
        "D#4": '68', //D - D#4
        "E4": '67',  //C - E4
        "F4": '86',  //V - F4
        "F#4": '71', //G - F#4
        "G4": '66',  //B - G4
        "G#4": '72', //H - G#4
        "A4": '78',  //N - A4
        "A#4": '74', //J - A#4
        "B4": '77',  //M - B4
        "C5": '81',  //Q - C5
        "C#5": '50', //2 - C#5
        "D5": '87',  //W - D5
        "D#5": '51', //3 - D#5
        "E5": '69',  //E - E5
        "F5": '82',  //R - F5
        "F#5": '53', //5 - F#5
        "G5": '84',  //T - G5
        "G#5": '54', //6 - G#5
        "A5": '89',  //Y - A5
        "A#5": '55', //7 - A#5
        "B5": '85', //U - B5
    }
    activeOscillators = {}
    activeGainNodes = {}


    sineButton.addEventListener('click', function () {
        waveform = "sine";
    });
    sawtoothButton.addEventListener('click', function () {
        waveform = "sawtooth"
    });
    triangleButton.addEventListener('click', function () {
        waveform = "triangle";
    });
    squareButton.addEventListener('click', function () {
        waveform = "square";
    });

    uploadExample.addEventListener('click', function () {
        document.getElementById('content-target').value = exampleSong;
        fileContent = exampleSong;   
    });


    function playNote(key) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.type = waveform;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        osc.connect(gainNode).connect(globalGain);
        osc.start();
        activeOscillators[key] = osc
        activeGainNodes[key] = gainNode
        numGain = Object.keys(activeGainNodes).length;
        //gain is reduced by number of active gain nodes
        Object.keys(activeGainNodes).forEach((key) =>
            activeGainNodes[key].gain.setTargetAtTime(0.5 / numGain, audioCtx.currentTime, 0.01)
        );

        gainNode.gain.setTargetAtTime(.4 / numGain, audioCtx.currentTime + attack, 0.1);
        

    }

    document.getElementById('input-file')
        .addEventListener('change', getFile)

    function getFile(event) {
        const input = event.target
        if ('files' in input && input.files.length > 0) {
            placeFileContent(
                document.getElementById('content-target'),
                input.files[0])
        }
    }

    function placeFileContent(target, file) {
        readFileContent(file).then(content => {
            target.value = content;
            fileContent = content;
        }).catch(error => console.log(error))
    }

    function readFileContent(file) {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result)
            reader.onerror = error => reject(error)
            reader.readAsText(file)
        })
    }

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {

            activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
            activeGainNodes[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
            activeOscillators[key].stop(audioCtx.currentTime + 0.05)
            //release portion of the envelope

            delete activeOscillators[key];
            delete activeGainNodes[key]
        }
    }
    function noteUp(key) {
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {

            activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
            activeGainNodes[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
            activeOscillators[key].stop(audioCtx.currentTime + 0.05)

            
            delete activeOscillators[key];
            delete activeGainNodes[key]
        }
    }

    async function playUpload() {
        //parsing and playing of amc
        var splitByLine = fileContent.split('\n');
        var isRest = false;
        var tempo = parseInt(splitByLine[0]);

        for (var i = 1; i < splitByLine.length; i++) {

            var isRest = false;
            var notes = splitByLine[i].split(',')
            var beat = 60000 / tempo;
            var duration = beatMap[notes[notes.length - 1]] * beat;
            //console.log(duration)
            for (var j = 0; j < notes.length - 1; j++) {
                if (notes[j] == "R") {
                    var isRest = true;
                    break;

                }
                //console.log(notes[j]);
                playNote(noteIndexMap[notes[j]]);
            }
            await sleep(duration);
            if (!isRest) {
                for (var k = 0; k < notes.length - 1; k++) {
                    noteUp(noteIndexMap[notes[k]]);
                }
            }

        }

    }




    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);
    uploadPlay.addEventListener('click', playUpload, false);


});