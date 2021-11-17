import {hello} from "./src/hello.js";
import {rainConfetti} from "./src/confetti.js";
import * as Tone from "./_snowpack/pkg/tone.js";
let coolNoteOnIce = Tone.Frequency("C4");
let hotBeatOnFire = 1;
let loopdy = scribbling();
let looptdyLoop = [];
window["scribbles"] = () => {
  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");
  loopdy = scribbling();
  Tone.Transport.start();
};
function scribbling() {
  const synth = new Tone.MembraneSynth().toMaster();
  return new Tone.Loop(function(time) {
    console.log(time);
    synth.triggerAttackRelease(coolNoteOnIce.toNote(), "4n");
  }, hotBeatOnFire).start(0);
}
document.addEventListener("click", (event) => {
  rainConfetti("canvas");
  looptdyLoop.push(loopdy);
  loopdy = scribbling();
});
document.addEventListener("mousemove", (event) => {
  let mousex = event.clientX;
  let mousey = event.clientY;
  console.log([mousex, mousey]);
  var now = Tone.Transport.now();
  hotBeatOnFire = 60 / normalizeToRange(mousey, 0, 512, 0, window.innerHeight);
  coolNoteOnIce = Tone.Frequency(normalizeToRange(mousex, 0, 127, 0, window.innerWidth), "midi");
  if (loopdy) {
    loopdy.interval = hotBeatOnFire;
  }
});
function normalizeToRange(value, targetMin, targetMax, actualMin, actualMax) {
  return value * (targetMax - targetMin) / (actualMax - actualMin);
}
