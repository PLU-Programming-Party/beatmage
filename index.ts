import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";
import * as Tone from "tone";
import $ from "jquery";

const miniMidi = 24;
const bigiMidi = 108;

$("#thescribler").on("click", (event) => {
  event.stopPropagation();
  bringTheNoys();
});

async function bringTheNoys() {
  $("#thescribler").hide();

  paintMeLikeOneOfYourFrenchCanvases();

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
  const synth = new Tone.PolySynth().toDestination();

  function scribbling(
    coolerNoteOnIce: Tone.FrequencyClass<number> | undefined,
    hotterBeatOnFire: number
  ) {
    return new Tone.Loop(function (time) {
      // Run once per eighth note, 8n, & log the time
      // trigger synth note
      synth.triggerAttackRelease(
        (coolerNoteOnIce ?? coolestNoteOnIce).toNote(),
        "16n"
      );
    }, hotterBeatOnFire).start(0);
  }

  document.addEventListener("mousemove", (event) => {
    let mousex = event.clientX;
    let mousey = event.clientY;
    hottestBeatOnFire =
      60 / normalizeToRange(mousey, 0, 512, 0, window.innerHeight);
    coolestNoteOnIce = Tone.Frequency(
      normalizeToRange(mousex, miniMidi, bigiMidi, 0, window.innerWidth),
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

    const hotBeatOnFire =
      60 / normalizeToRange(mousey, 0, 256, 0, window.innerHeight);
    const coolNoteOnIce = Tone.Frequency(
      normalizeToRange(mousex, miniMidi, bigiMidi, 0, window.innerWidth),
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
    return Math.round((value * (targetMax - targetMin)) / (actualMax - actualMin));
  }
}

function paintMeLikeOneOfYourFrenchCanvases() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";

  const draw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    thisManyLinesOnTheFrenchCanvas(ctx, 8);
  };

  // May use in the future to draw a line?
  function scribles(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function thisManyLinesOnTheFrenchCanvas(
    ctx: CanvasRenderingContext2D,
    n: number
  ) {
    for (let i = 0; i < n; i++) {
      const x = (i * canvas.width) / (n - 1);
      ctx.beginPath();
      ctx.moveTo(x, canvas.height);
      ctx.lineTo(x, 0);
      ctx.stroke();
    }
  }

  document.body.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw(canvas);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(canvas);
  });
}
