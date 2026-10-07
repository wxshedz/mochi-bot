export const mochiPhrases = [
  'hi hi~ mochi is a little sleepy today',
  'sending you soft hugs and good vibes',
  'mochi loves spending time with you',
  'remember to stay hydrated and take breaks! mochi cares about you',
  'you are doing amazing, mochi is so proud',
  'lets make today cozy together',
  'mochi is here if you need anything, just ask',
  'the moon looks extra pretty tonight, does not it?',
  'mochi hopes you are having a wonderful day',
  'you are a star in velvetmoons sky',
  'mochi thinks you are really neat',
  'comfy vibes only~ lets relax together',
  'mochi believes in you! you have got this',
  'take a deep breath... everything will be okay',
  'you make velvetmoon feel like home',
];

export const errorResponses = [
  'oops, mochi did not get that, try again?',
  'hmm, mochi is confused... could you try that again?',
  'that did not work... mochi might need help with that one',
];

export function getRandomMochiPhrase() {
  return mochiPhrases[Math.floor(Math.random() * mochiPhrases.length)];
}

export function getErrorReply() {
  return errorResponses[Math.floor(Math.random() * errorResponses.length)];
}

export function getWelcomeMessage(user) {
  return `hi ${user}! i am mochi, welcome to velvetmoon - stop by the rules and grab your roles, i saved you a spot`;
}

export function getLevelUpMessage(user, level) {
  return `${user} just reached **level ${level}**! mochi is so proud`;
}

export function getGiveawayStartMessage(prize, endTime, winners) {
  const winnerText = winners === 1 ? 'winner' : 'winners';
  return `giveaway time! click the button to join, mochi is crossing his fingers for you\n\n**prize:** ${prize}\n**${winners} ${winnerText}** will be chosen\n**ends:** ${endTime}`;
}

export function getGiveawayEndMessage(prize, winners) {
  if (winners.length === 0) {
    return `the giveaway for **${prize}** has ended, but no one entered... mochi is a bit sad`;
  }
  
  const winnerList = winners.join(', ');
  const congratsText = winners.length === 1 ? 'congratulations' : 'congratulations to all of you';
  
  return `the giveaway for **${prize}** has ended!\n\n**winner${winners.length > 1 ? 's' : ''}:** ${winnerList}\n\n${congratsText}! mochi is so happy for you`;
}

export function getDailyQuestionMessage(question) {
  return `question of the day: **${question}**\n\nmochi wants to know what you think`;
}

export function getTopChatterMessage(user, messageCount) {
  return `this weeks top chatter is ${user} with **${messageCount} messages**! mochi sends you a big hug and a round of applause`;
}

export function getRankDescription(xp, level, xpForNext, rank) {
  const xpNeeded = xpForNext - xp;
  return `**level:** ${level}\n**xp:** ${xp.toLocaleString()} / ${xpForNext.toLocaleString()}\n**rank:** #${rank}\n\n${xpNeeded.toLocaleString()} xp until level ${level + 1}`;
}
