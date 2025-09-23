const synth = window.speechSynthesis;

function speak(text: string) {
  let utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.7;//速度
  utterance.pitch = 0.5;//音调
  utterance.volume = 1;//音量
  synth.speak(utterance);
}

export default { speak };