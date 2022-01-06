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

const canvas = document.createElement("canvas")
canvas.style.position = "absolute"
canvas.style.top = "0"
canvas.style.left = "0"

const draw = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, canvas.height/2, 0, 2 * Math.PI);
  ctx.stroke();
  scribles(ctx, canvas.width/4, canvas.height, canvas.width/4, 0);
  scribles(ctx, canvas.width/2, canvas.height, canvas.width/2, 0);
  scribles(ctx, 3*(canvas.width/4), canvas.height, 3*(canvas.width/4), 0);
}

function scribles(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number){
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();



      
}

//ToDo draw lines method



document.body.appendChild(canvas);

canvas.width = window.innerWidth
canvas.height = window.innerHeight
draw(canvas)

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  draw(canvas)
})
