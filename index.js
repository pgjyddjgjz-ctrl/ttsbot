const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const discordTTS = require('discord-tts');
const http = require('http');

// 1. Serveur HTTP pour empêcher Render de tuer le bot (le port 3000)
http.createServer((req, res) => res.end('OK')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag} !`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!dis')) return;
    
    const text = message.content.slice(4).trim();
    const channel = message.member?.voice.channel;
    
    if (!channel) return message.reply("Rejoins un salon vocal !");

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        const stream = discordTTS.getVoiceStream(text);
        const resource = createAudioResource(stream, { inputType: 0 });
        
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', (e) => {
            console.error("Erreur Player:", e);
            connection.destroy();
        });
    } catch (e) {
        console.error("Erreur:", e);
    }
});

client.login(process.env.DISCORD_TOKEN);
