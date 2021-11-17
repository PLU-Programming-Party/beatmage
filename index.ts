import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";
import * as Tone from "tone";

// TODO: Click to save beat

let coolNoteOnIce = Tone.Frequency("C4");
let hotBeatOnFire = 1;
let loopdy = scribbling();
let looptdyLoop: Tone.Loop[] = [];

window["scribbles"] = () => {
  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");

  // create a new tone loop
  loopdy = scribbling();
  // Start the transport which is the main timeline

  Tone.Transport.start();

  // Tone.Transport.bpm.rampTo(1000, 1000)
};

function scribbling() {
  const synth = new Tone.MembraneSynth().toMaster();
  return new Tone.Loop(function (time) {
    // Run once per eighth note, 8n, & log the time
    console.log(time);
    // trigger synth note
    synth.triggerAttackRelease(coolNoteOnIce.toNote(), "4n");
  }, hotBeatOnFire).start(0);
}

document.addEventListener("click", (event) => {
  rainConfetti("canvas");
  looptdyLoop.push(loopdy);
  loopdy = scribbling();
});

document.addEventListener("mousemove", (event) => {
  let mousex = event.clientX; // Gets Mouse X
  let mousey = event.clientY; // Gets Mouse Y
  console.log([mousex, mousey]); // Prints data
  var now = Tone.Transport.now();
  // TODO:　tame them beatz yo
  //Tone.Transport.bpm.setValueAtTime(normalizeToRange(mousey, 0, 1/1000, 0, window.innerHeight), now);
  //bleatspeak
  hotBeatOnFire = 60 / normalizeToRange(mousey, 0, 512, 0, window.innerHeight);
  coolNoteOnIce = Tone.Frequency(
    normalizeToRange(mousex, 0, 127, 0, window.innerWidth),
    "midi"
  );
  if (loopdy) {
    loopdy.interval = hotBeatOnFire;
  }
});

function normalizeToRange(
  value: number,
  targetMin: number,
  targetMax: number,
  actualMin: number,
  actualMax: number
): number {
  return (value * (targetMax - targetMin)) / (actualMax - actualMin);
}
