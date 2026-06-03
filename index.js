const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const http = require('http');

// Garde le service en vie pour Render
http.createServer((req, res) => res.end('Bot actif')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!dis')) return;
    
    const text = message.content.slice(4).trim();
    const channel = message.member?.voice.channel;

    if (!channel) return message.reply("Rejoins un salon !");

    try {
        // 1. Génération de l'URL
        const url = googleTTS.getAudioUrl(text, { lang: 'fr', slow: false });
        console.log("URL générée :", url); // <--- Vérifie ça dans tes logs

        // 2. Connexion
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        // 3. Lecture
        const player = createAudioPlayer();
        const resource = createAudioResource(url);
        
        connection.subscribe(player);
        player.play(resource);

        player.on('error', error => {
            console.error("Erreur du lecteur :", error);
            message.channel.send("Erreur de lecture : " + error.message);
        });

        message.react('✅');
    } catch (err) {
        console.error("Erreur critique :", err);
        message.reply("Erreur : " + err.message);
    }
});

client.login(process.env.DISCORD_TOKEN);
