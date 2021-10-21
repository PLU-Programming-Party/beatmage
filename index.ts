import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";
import * as Tone from 'tone';

window.scribbles = () => {
  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");

  const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();
  const pingPong = new Tone.PingPongDelay("4n", 0.2).toDestination();
  const mult = new Tone.Multiply(10);
  const synth = new Tone.PolySynth()
      .connect(pingPong)
      .connect(tremolo)
      .connect(mult);
  // set the attributes across all the voices using 'set'
  synth.set({ detune: -1200 });
  // play a chord
  synth.triggerAttackRelease(["D1", "D3", "C4", "F4", "A4", "C4"], 1);
};
