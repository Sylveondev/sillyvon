const { Client, Intents, MessageEmbed, Colors, MessageActionRow, ButtonInteraction, MessageButton } = require("discord.js");
const invitesTracker = require("discord-invites-tracker-sqlite");

const express = require("express");

require("dotenv").config();

// Module made possible with this script below.
// https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/making-your-own-starboard.md
function extension(attachment) {
  const imageLink = attachment.split(".");
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return null;
  return attachment;
}

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INVITES],
    allowedMentions: { parse: [] }
});

const tracker = new invitesTracker(client);

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setPresence({ activities: [{ name: '!s help', type: `LISTENING` }, { name: 'invites', type: `WATCHING` }], status: 'dnd' });

});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || message.webhookId) return;
    const prefix = process.env['prefix'];
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (message.guild.id == "1198780918681313340") {
        
        if (command == "help") {
            await message.reply(`:wave: Hi there, I'm Sillyvon. I'm a bot designed by SylveonDev for some friend servers that require it.\n\n## ${message.guild.name} specific commands:\n* \`!s staff\` : Lists the server staff\n* \`!s pingmod\` : Pings a random mod for help\n* \`!s invites\` : Shows a member's invite stats\n* \`!s invited\` : Guesses who invited a member (not very accurate)`);
        }

        if (command == "pingmod") {
            await message.guild.members.fetch();
            await message.guild.roles.fetch();

            const mods = await message.guild.members.cache.filter(m => m.roles.cache.has("1222295580123074591") && m.presence?.status != "offline" && m.presence?.status != "dnd");
            const randomMod = mods.at(Math.floor(Math.random()* mods.size));

            message.reply({
                content: `Mod ping: ${randomMod}, **${message.member.displayName}** called for help.`,
                allowedMentions: { parse: ["users"] }
            })
        }

        if (command == "staff") {
            await message.guild.members.fetch();
            await message.guild.roles.fetch();

            const mods = await message.guild.members.cache.filter(m => m.roles.cache.has("1222295580123074591") && !m.roles.cache.has("1216225540021686272"));
            const admins = await message.guild.members.cache.filter(m => m.roles.cache.has("1216225540021686272"));
            const onbreak = await message.guild.members.cache.filter(m => m.roles.cache.has("1267986476361056257"));

            const embed = new MessageEmbed()
            .setTitle(`${message.guild.name} staff`)
            .setFields([
                { name: "Mods", value: mods?.map(m => m) + "." },
                { name: "Admins", value: admins?.map(m => m) + "." },
                { name: "On break", value: onbreak?.map(m => m) + "." },
            ])
            .setColor("RANDOM")

            message.reply({ embeds: [embed] });
        }

        if (command == "invites") {
            if (args[0]) {
                const member = await message.guild.members.fetch(args[0]).catch(() => {
                    message.reply(`Didn't find that member.`);
                })
                if (!member) return;

                let invites = await tracker.getInvites(member, message.guild);
                console.log(invites);
                const embed = new MessageEmbed()
                .setDescription(`${member} has ${invites.total} invites.\n> ${invites.regular} regular\n> ${invites.bonus} bonus\n> ${invites.leaves} leaves\n> ${invites.fake} fakes`)
                .setColor("RANDOM")
                message.reply({ embeds: [embed] });
            } else {
                let invites = await tracker.getInvites(message.member, message.guild);
                console.log(invites);
                const embed = new MessageEmbed()
                .setDescription(`${message.author} has ${invites.total} invites.\n> ${invites.regular} regular\n> ${invites.bonus} bonus\n> ${invites.leaves} leaves\n> ${invites.fake} fakes`)
                .setColor("RANDOM")
                message.reply({ embeds: [embed] });
            }
            
        };

        if (command == "invited") {
            if (args[0]) {
                const member = await message.guild.members.fetch(args[0]).catch(() => {
                    message.reply(`Didn't find that member.`);
                })
                if (!member) return;

                const inviteData = await tracker.getUserData(member);
                console.log(inviteData);

                if (!inviteData.invitedBy) return message.reply(`I don't know how **${member.displayName}** joined. Try looking in <#1279334497145454663> to see if it's there.`)
                if (inviteData.invitedBy == "vanity") return message.reply(`**${member.displayName}** joined via the vanity invite.`)
                message.reply({ content: `**${member.displayName}** was invited by <@${inviteData.invitedBy.id}>.`, allowedMentions: { parse: [] }});
            }
        }
    }
});

tracker.on("guildMemberAdd", (member) => {
    if (member.guild.id == "1198780918681313340") {
        const welcomeChannel = member.guild.channels.cache.get("1279334497145454663");

        if (!member.inviter) return welcomeChannel.send(`I'm not sure who invited ${member}. They may have joined through the vanity invite.`);
        if (member.inviter == "vanity") return welcomeChannel.send(`Welcome ${member}! They joined from the vanity invite.`);
        else return welcomeChannel.send(`Welcome ${member}! Invited by ${member.inviter} (${member.invites.total} invites)`);
    }
});

client.login(process.env["TOKEN"]);
