import { hello } from "./src/hello";
import { rainConfetti } from "./src/confetti";

window.scribbles = () => {
  hello("clover");
  hello("hazel");
  hello("tunnie");
  rainConfetti("canvas");
};
