require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

const errorMessage = { content: "No message to ping" };
const noReactMessage = { content: "No one reacted" };

let messages = new Map();

client.once("ready", () => {
  console.log("Notify reactions is up and running");
});
client.login(process.env.TOKEN);

client.on("message", async (message) => {
  if (message.mentions.users.size < countAts(message.content)) {
    messages.set(message.author.id, message);
  } else if (message.content.toLowerCase().includes("!clock in <@")) {
    let userID = message.mentions.users.keys().next().value;
    let messageToSend = await findReactorsByUserID(userID);
    message.channel.send(messageToSend);
  } else if (
    message.content.toLowerCase().includes("!clock in https://discordapp.com/")
  ) {
    let messageID = message.content.split("/").pop();
    let fetchedMessage = await message.channel.messages.fetch(messageID, false);
    let messageToSend = await pingReactors(fetchedMessage);
    message.channel.send(messageToSend);
  } else if (message.content.toLowerCase().includes("!clock in")) {
    let messageToSend = await findReactorsByUserID(message.author.id);
    message.channel.send(messageToSend);
  }
});

function findReactorsByUserID(userID) {
  if (messages.has(userID)) {
    let pingedMessage = messages.get(userID);
    return pingReactors(pingedMessage);
  } else {
    return errorMessage;
  }
}

async function pingReactors(message) {
  let reactions = message.reactions.cache;
  let usersReacted = new Set();
  for (let reaction of reactions.values()) {
    let users = await reaction.users.fetch();
    users.forEach((value, key) => usersReacted.add(key));
  }
  let botMessage = "> " + message.cleanContent + "\n" + "So which one of you is throwing today :noobalert:" + "\n";
  usersReacted.forEach((user) => {
    botMessage += ` <@${user}>`;
  });
  return usersReacted.size ? botMessage : noReactMessage;
}

function countAts(string) {
  let count = 0;
  for (let i = 0; i < string.length; i++) {
    if (string[i] === "@") count++;
  }
  return count;
}
