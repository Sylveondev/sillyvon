# Sillyvon
Sillyvon is a simple private invite tracking and management bot for the [SylveonDev](https://discord.gg/sylveondev) discord. It handles most automations in the server that the other bots, like Phoenix, doesn't do.

## Key features
Sillyvon uses a customizable per server config. This allows you to add commands and events to specific servers. For instance, in SylveonDev Sillyvon changes the banner every hour, in another server you can code in a automod to delete invites based on regexes.

# Running the bot yourself
Since Sillyvon is a private bot, I won't provide support on how to get it working in your own server. However, all you need is **Nodejs** to run this bot. Everything you need can be modified in the `index.js` file.

1. Clone this repository
2. Create a `.env` file and add these lines to it. Fill in the blanks with your bot token and the prefix you want to use.
```
TOKEN=
prefix=
```
3. Install dependencies with `npm i` and run the bot with `node index.js`

# Screenshots
Below are examples of Sillyvon being used in my server. If you want to use my server's config as a template, you can find it in the `index.js` file.<br><br>
### Every command in my server<br>
![image](https://github.com/user-attachments/assets/4d396bd1-aa61-4524-97bc-4bbc118be46a)
### Invite tracking<br>
![image](https://github.com/user-attachments/assets/789846a7-a52d-4c9e-a8d0-cd41241953ac)
### Staff listing<br>
![image](https://github.com/user-attachments/assets/95a17d91-f619-4f61-9122-94494d210b62)
### Banner generation<br>
![image](https://github.com/user-attachments/assets/1e44bc2b-0fcd-4254-9898-5ed4267fc21d)
### Mass role assigning<br>
![image](https://github.com/user-attachments/assets/92deb4b3-78e6-47e8-b365-83676488a69c)
### Diddo, but punishments<br>
![image](https://github.com/user-attachments/assets/8a4cea0c-b69b-4bd6-8098-744a036fab1a)
### Banner rotation log<br>
![image](https://github.com/user-attachments/assets/d1ab73ec-fb78-41c4-ae14-979e0ac9404c)
