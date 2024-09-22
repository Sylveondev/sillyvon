const { Client, Intents, MessageEmbed, Colors } = require("discord.js");
const invitesTracker = require("discord-invites-tracker-sqlite");

require("dotenv").config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INVITES],
    allowedMentions: { parse: [] }
});

const tracker = new invitesTracker(client);

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setPresence({ activities: [{ name: '!invites', type: `LISTENING` }, { name: 'invites', type: `WATCHING` }], status: 'dnd' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || message.webhookId) return;

    if (message.content.startsWith('!invites')) {
        let invites = await tracker.getInvites(message.member, message.guild);
	console.log(invites);
	const embed = new MessageEmbed()
	.setDescription(`${message.author} has ${invites.total} invites.\n> ${invites.regular} regular\n> ${invites.bonus} bonus\n> ${invites.leaves} leaves\n> ${invites.fake} fakes`)
	.setColor("RANDOM")
        message.reply({ embeds: [embed] });
    };
});

tracker.on("guildMemberAdd", (member) => {
    const welcomeChannel = member.guild.channels.cache.get("1279334497145454663");

    if (!member.inviter) return welcomeChannel.send(`I'm not sure who invited ${member}. They may have joined through the vanity invite.`);
    else return welcomeChannel.send(`Welcome ${member}! Invited by ${member.inviter} (${member.invites.total} invites)`);
});

client.login(process.env["TOKEN"]);
