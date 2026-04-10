import { Avatar } from './avatar.js';
import { Chat }   from './chat.js';

const avatar = new Avatar('main-canvas', 'mini-canvas');
const chat   = new Chat(avatar);

window.handleSend = () => {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  chat.send(text);
};

window.sendSuggestion = (text) => chat.send(text);

window.setState = (state) => avatar.setState(state);
