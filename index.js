const { Client, Intents, MessageEmbed, Colors, MessageActionRow, ButtonInteraction, MessageButton, MessageAttachment } = require("discord.js");
const invitesTracker = require("discord-invites-tracker-sqlite");

const express = require("express");

const { createCanvas, loadImage } = require('@napi-rs/canvas')

require("dotenv").config();

// Module made possible with this script below.
// https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/making-your-own-starboard.md
function extension(attachment) {
  const imageLink = attachment.split(".");
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png)/gi.test(typeOfImage);
  if (!image) return null;
  return attachment;
}
function isPng(attachment) {
    const imageLink = attachment.split(".");
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(png)/gi.test(typeOfImage);
    if (!image) return false;
    return true;
  }

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INVITES],
    allowedMentions: { parse: [] }
});

const tracker = new invitesTracker(client);

let lastBanner = -1;

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setPresence({ activities: [{ name: ';help', type: `LISTENING` }, { name: 'invites', type: `WATCHING` }], status: 'dnd' });

    setInterval(async () => {
        try {
            const imagehost = await client.channels.fetch('1303174589609803887');
            const images = await imagehost.messages.fetch();
            console.log(`Images in pool: ${images.size}`);
            let pick = Math.floor(Math.random() * images.size);
            while (pick == lastBanner) {
                pick = Math.floor(Math.random() * images.size);
            }
            lastBanner = pick;
            console.log(`Picked banner: ${pick}`);
            const pickedimage = images.at(pick);
            const submitter = await client.users.fetch(pickedimage.content).catch(() => undefined);

            const guild = await client.guilds.fetch('1198780918681313340');
            const channel = await guild.channels.fetch('1303168972224593952');
            const embed = new MessageEmbed()
            .setTitle(`Banner rotation \` ${pick} \``)
            .setImage(pickedimage.attachments.first().url)
            .setTimestamp(new Date())
            .setFooter({
                text: `Unknown submitter`
            })
            .setColor("RANDOM");
            
            if (submitter) {
                embed.setFooter({
                    text: `Submitted by: ${submitter?.tag} • ${submitter?.id}`,
                    iconURL: submitter.displayAvatarURL({ dynamic: true, size: 512 })
                });
            }
            channel.send({ embeds: [embed] });

            guild.setBanner(pickedimage.attachments.first().url, `[ Banner rotation ] Banner is now "ID ${pick}" by ${submitter.tag} (${submitter.id}).`)
        }
        catch (err) {
            console.warn(`Failed to change banner`, err);
        }
    }, 3_600_000)

});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || message.webhookId) return;

    if (message.guild.id == "1198780918681313340") {
        if (message.channel.id == "1303221279951949845" && message.attachments.size) {
            if (!(await extension(message.attachments.at(0).url))) return;
            if (!isPng(message.attachments.at(0).url)) {
                message.channel.send({ content: `${message.author}, your image isn't in the correct format. Submissions must be png, and exactly 960x540px in size.` }).then(m => setTimeout(()=>m.delete(), 5_000));
                message.delete();
                return;
            }
            message.react(`🔼`).then(()=>message.react(`🔽`));
        }
    }

    const prefix = process.env['prefix'];
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (message.guild.id == "1198780918681313340") {
        
        if (command == "help") {
            await message.reply(`:wave: Hi there, I'm Sillyvon. I'm a bot designed by SylveonDev for some a very specific few servers that require it. Note: This bot is a private bot and can only be added to specific servers.\n## ${message.guild.name} specific commands:\n* \`;ping\` : Checks if the bot is alive\n* \`;staff\` : Lists the server staff\n* \`;pingmod\` : Pings a random mod for help\n* \`;invites\` : Shows a member's invite stats\n* \`;invited\` : Guesses who invited a member\n* \`;whatbanner\` : Sends the current server's banner\n* \`;banner\` : Creates a banner from an image`);
        }

        if (command == "ping") {
            await message.reply(`:wave: Hello there.`)
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

                if (!inviteData.invitedBy) return message.reply(`I don't know how **${member.displayName}** joined. I was not online when they joined, or they joined before my invite tracking was implemented.`)
                if (inviteData.invitedBy == "vanity") return message.reply(`**${member.displayName}** joined via the vanity invite.`)
                message.reply({ content: `**${member.displayName}** was invited by <@${inviteData.invitedBy.id}>.`, allowedMentions: { parse: [] }});
            }
        }

        if (command == "whatbanner") {
            message.reply({ content: "Here's the current banner.", files: [message.guild.bannerURL({ format: "png" })] })
        }

        if (command == "banner") {
            try {
                if (!message.attachments.size) return message.reply(`An image is required to use this command.`);
                if (!(await extension(message.attachments.at(0).url))) return message.reply(`Not a valid image type.`);

                const canvas = createCanvas(960, 540);
                const ctx = canvas.getContext('2d');

                const watermark = await loadImage('https://images2.imgbox.com/d2/23/aeHFKEsA_o.png');
                const img = await loadImage(message.attachments.at(0).url);

                var hRatio = canvas.width / img.width;
                var vRatio =  canvas.height / img.height;
                var ratio  = Math.max( hRatio, vRatio );
                var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
                var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
                ctx.clearRect(0,0,canvas.width, canvas.height);
                ctx.drawImage(img, 0,0, img.width, img.height,
                    centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
                ctx.drawImage(watermark, 0, 0, canvas.width, canvas.height);
                
                const pngData = await canvas.encode('png');
                const attachment = new MessageAttachment()
                .setFile(pngData)
                .setName('banner.png');

                message.reply({ content: `Generated your banner. Go to <#1303221279951949845> to submit it.`, files: [attachment] });
            }
            catch (err) {
                message.reply('Oops, something went wrong.');
                console.warn(`Silly: failed to generate image`, err);
            }
        }
    }
    else {
        if (command == "help") {
            await message.reply(`:wave: Hi there, I'm Sillyvon. I'm a bot designed by SylveonDev for some a very specific few servers that require it. Note: This bot is a private bot and can only be added to specific servers.\n:no_entry_sign: **${message.guild.name}** is not setup to use Sillyvon. Please ask SylveonDev what you want Sillyvon to do.`);
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
