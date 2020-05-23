require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

const errorMessage = { content: "No message to ring" };
const noReactMessage = { content: "No one reacted" };

let messages = new Map();

client.once("ready", () => {
  console.log("Notify reactions is up and running");
});
client.login(process.env.TOKEN);

client.on("message", (message) => {
  if (message.content.includes("@") && !message.mentions.users.size) {
    messages.set(message.author.id, message);
  } else if (message.content.includes("!ring <@")) {
    let userID = message.mentions.users.keys().next().value;
    message.channel.send(pingReactors(userID));
  } else if (message.content.includes("!ring")) {
    message.channel.send(pingReactors(message.author.id));
  }
});

function pingReactors(userID) {
  if (messages.has(userID)) {
    let pingedMessage = messages.get(userID);
    let reactions = pingedMessage.reactions.cache;
    let usersReacted = new Map();
    reactions.forEach((reaction) => {
      reaction.users.cache.forEach((value, key) => {
        usersReacted.set(key, value);
      });
    });
    let botMessage = "```" + pingedMessage.content + "```\n";
    usersReacted.forEach((user) => {
      botMessage += ` <@${user.id}>`;
    });
    return usersReacted.size ? botMessage : noReactMessage;
  }
  return errorMessage;
}
