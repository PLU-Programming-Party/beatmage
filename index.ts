import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";
import * as Tone from 'tone';

window.scribbles = () => {
  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");

  // create a new synth
const synth = new Tone.MembraneSynth().toMaster();
// create a new tone loop
const loop = new Tone.Loop(function(time) {
  // Run once per eighth note, 8n, & log the time
  console.log(time);
  // trigger synth note
  synth.triggerAttackRelease("C2", "4n");
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
  Tone.Transport.bpm.setValueAtTime(mousey, now);
  //TO DO: change pitch with x mouse position

});

