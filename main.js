require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

const errorMessage = { content: "No message to ping" };
const noReactMessage = { content: "You have no friends" };

// This will be a map where the key is a user (ID) and the value is an array containing their most recent role mention messages
let messages = new Map();

client.once("ready", () => {
  console.log("Notify reactions is up and running");
});
client.login(process.env.TOKEN);

client.on("message", async (message) => {
  // On each message, if it has a role mention, add it to a user's Map
  if (message.mentions.roles.size) {
    let userMessages = messages.get(message.author.id)
      ? messages.get(message.author.id)
      : [];
    userMessages.unshift(message);
    userMessages = userMessages.slice(0, 5);
    messages.set(message.author.id, userMessages);
    console.log("messages", messages);
  }
  // Handle clock in command that mentions a user
  else if (
    message.content.toLowerCase().includes("!clock in") &&
    message.mentions.users.size
  ) {
    let userID = message.mentions.users.keys().next().value;
    let messageToSend = await findMessageToPing(userID);
    message.channel.send(messageToSend);
  }
  // Handle clock in command that includes message link
  else if (
    message.content.toLowerCase().includes("!clock in https://discord")
  ) {
    let messageID = message.content.split("/").pop();
    let fetchedMessage = await message.channel.messages.fetch(messageID, false);
    let messageToSend = await pingReactors(fetchedMessage);
    message.channel.send(messageToSend);
  }
  // Handle generic clock in command (check author's messages)
  else if (message.content.toLowerCase().includes("!clock in")) {
    let messageToSend = await findMessageToPing(message.author.id);
    message.channel.send(messageToSend);
  }
});

async function findMessageToPing(userID) {
  if (messages.has(userID)) {
    let userMessages = messages.get(userID);
    for (const message of userMessages) {
      if (message.reactions.cache.size) {
        return pingReactors(message);
      }
    }
    return noReactMessage;
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
  let botMessage =
    "> " +
    message.cleanContent +
    "\n" +
    "Help me I'm trapped in a discord bot my name is Alex Sw-" +
    "\n";
  usersReacted.forEach((user) => {
    botMessage += ` <@${user}>`;
  });
  return botMessage;
}
