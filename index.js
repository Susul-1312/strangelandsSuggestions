// requiries and shit yøu dont have to care about
require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
// setting general bot constants
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

// setting suggestion constants
const sugID = process.env.SUGID;
const delID = process.env.DELID;

client.on("ready", function() {
	console.log(`${client.user.tag} logged in and ready for Suggestions`); // just to see when its ready
});

client.on("message", (msg) => {
	if (msg.author.id == client.user.id) return; // dont respond to yourself

	if (msg.channel.id == sugID) react(msg); // if its in the suggestion channel, react

	if (msg.content.startsWith(prefix)) commandHandler(msg, prefix); // it starts with the prefix, so command
});

client.login(token);


function react(msg) { // function with reactions to not clutter the main part
	msg.react("✅").then(function() {msg.react("❎")}); // react with the stuff
}

function commandHandler(msg, p) {
	var args = msg.content.slice(p.length).split(" "); // slicing of the prefix
	const command = args.shift();

	switch(command) {
		case "ping":
			msg.reply("Pong, Bot still alive, doing what it must because it can…");
			break;
		case "delete":
			deleteSuggestion(msg, args);
			break;
		default:
			msg.channel.send(`Not a command: \`${command}\``);
	}
}


function checkPerms(user) {
	return(
		user.hasPermission('MANAGE_MESSAGES') // users that manage messages can manage suggestions
		|| user.roles.cache.some((role) => role.name == "Developer") // developers also because, because
		|| user.id == "496947965135683606" // Me overwrite, cuz security
	);
}

async function deleteSuggestion(msg, args) {
	if (checkPerms(msg.member)) {
		try {
			const suggestion = await client.channels.cache.get(sugID).messages.fetch(args[0]);
			args.shift();

			const up = suggestion.reactions.cache.find((r,k) => k == "✅").count; // PLEASE JUST FUCKING KILL ME
			const down = suggestion.reactions.cache.find((r,k) => k == "❎").count;

			const deleteEmbed = new Discord.MessageEmbed()
				.setTitle("Suggestion Deleted")
				.setAuthor(suggestion.author.username, suggestion.author.avatarURL())
				.addField('Suggestion', suggestion.content)
				.addField('Upvotes', up, true)
				.addField('Downvotes', down, true)
				.addField('Reason', args.join(" "));

			const delChannel = await client.channels.cache.get(delID);
			delChannel.send(deleteEmbed);

			suggestion.delete();

			msg.channel.send("Suggestion was deleted");
		} catch (e) {
			console.log(e);
			msg.channel.send(`Error: \`${e.message}\``);
		}
	} else {
		msg.reply("Missing Permission")
	}
}
