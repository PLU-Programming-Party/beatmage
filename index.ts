import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";
import * as Tone from 'tone';

// TODO: Click to save beat

let coolNoteOnIce = Tone.Frequency("C4");

window.scribbles = () => {
  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");

  // create a new synth
  const synth = new Tone.MembraneSynth().toMaster();
  // create a new tone loop
  const loop = new Tone.Loop(function (time) {
    // Run once per eighth note, 8n, & log the time
    console.log(time);
    // trigger synth note
    synth.triggerAttackRelease(coolNoteOnIce.toNote(), "4n");
  }, "4n").start(0);
  // Start the transport which is the main timeline

  Tone.Transport.start();

  // Tone.Transport.bpm.rampTo(1000, 1000)
};

document.addEventListener("mousemove", (event) => {
  let mousex = event.clientX; // Gets Mouse X
  let mousey = event.clientY; // Gets Mouse Y
  console.log([mousex, mousey]); // Prints data
  var now = Tone.Transport.now()
  // TODO:　tame them beatz yo
  Tone.Transport.bpm.setValueAtTime(normalizeToRange(mousey, 0, 1000, 0, window.innerHeight), now);
  coolNoteOnIce = Tone.Frequency(normalizeToRange(mousex, 0, 127, 0, window.innerWidth), "midi");
});


function normalizeToRange(value: number, targetMin: number, targetMax: number, actualMin: number, actualMax: number): number {
  return value * (targetMax - targetMin) / (actualMax - actualMin);
}