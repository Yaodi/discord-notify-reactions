import TOKEN from "./secret";
const Discord = require("discord.js");
const client = new Discord.Client();

const errorMessage = { content: "You're not pinging anything" };
const noReactMessage = { content: "No one reacted" };

let messages = new Map();

client.once("ready", () => {
  console.log("Notify reactions is up and running");
});

client.login(TOKEN);

client.on("message", (message) => {
  if (message.content.includes("@") && !message.mentions.users.size) {
    messages.set(message.author.id, message);
  } else if (message.content.includes("!ping")) {
    if (messages.has(message.author.id)) {
      let pingedMessage = messages.get(message.author.id);
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
      pingedMessage.channel.send(
        usersReacted.size ? botMessage : noReactMessage
      );
    } else {
      message.channel.send(errorMessage);
    }
  }
});
