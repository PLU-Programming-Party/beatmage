import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";
import * as Tone from "tone";
import $ from "jquery";

$("#thescribler").on("click", event => {
  event.stopPropagation()
  bringTheNoys()
})


async function bringTheNoys() {
  $("#thescribler").hide();

  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");

  // TODO: Click to save beat
  await Tone.Transport.start();
  let coolestNoteOnIce = Tone.Frequency("C2");
  let hottestBeatOnFire = 1;
  let loopdy = scribbling(undefined, hottestBeatOnFire);
  let looptdyLoop: Tone.Loop[] = [];
  const synth = new Tone.MembraneSynth().toDestination();

  function scribbling(coolerNoteOnIce: Tone.FrequencyClass<number> | undefined, hotterBeatOnFire: number) {

    return new Tone.Loop(function (time) {
      // Run once per eighth note, 8n, & log the time
      // trigger synth note
      synth.triggerAttackRelease((coolerNoteOnIce ?? coolestNoteOnIce).toNote(), "4n");
    }, hotterBeatOnFire).start(0);
  }

  document.addEventListener("mousemove", (event) => {
    let mousex = event.clientX;
    let mousey = event.clientY;
    hottestBeatOnFire = 60 / normalizeToRange(mousey, 0, 512, 0, window.innerHeight);
    coolestNoteOnIce = Tone.Frequency(
      normalizeToRange(mousex, 0, 127, 0, window.innerWidth),
      "midi"
    );
    if (loopdy) {
      loopdy.interval = hottestBeatOnFire;
    }
  });
  document.addEventListener("click", (event) => {
    rainConfetti("canvas");
    let mousex = event.clientX; // Gets Mouse X
    let mousey = event.clientY; // Gets Mouse Y
    console.log([mousex, mousey]); // Prints data
    var now = Tone.Transport.now();


    const hotBeatOnFire = 60 / normalizeToRange(mousey, 0, 256, 0, window.innerHeight);
    const coolNoteOnIce = Tone.Frequency(
      normalizeToRange(mousex, 0, 127, 0, window.innerWidth),
      "midi"
    );
    scribbling(coolNoteOnIce, hotBeatOnFire);
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
};
