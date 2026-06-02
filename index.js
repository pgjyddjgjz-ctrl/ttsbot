const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const http = require('http');

http.createServer((req, res) => res.end('OK')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!dis')) return;
    const texte = message.content.slice(4).trim();
    if (!texte) return;

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Rejoins un salon !");

    try {
        console.log("Génération TTS pour:", texte);
        const url = googleTTS.getAudioUrl(texte, { lang: 'fr', slow: false, host: 'https://translate.google.com' });
        
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        console.log("Connecté au salon vocal.");

        const player = createAudioPlayer();
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

        connection.subscribe(player);
        player.play(resource);
        console.log("Lecture lancée.");

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', (err) => {
            console.error("Erreur Player:", err);
            connection.destroy();
        });

    } catch (e) {
        console.error("Erreur critique:", e);
        message.reply("Erreur : " + e.message);
    }
});

client.login(process.env.DISCORD_TOKEN);
