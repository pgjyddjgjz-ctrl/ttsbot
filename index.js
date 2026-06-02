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
        const url = googleTTS.getAudioUrl(texte, { lang: 'fr', slow: false });
        
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false // Important pour ne pas être ignoré par Discord
        });

        // On attend plus longtemps et on gère l'annulation
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        } catch (error) {
            connection.destroy();
            throw new Error("Connexion au salon trop lente.");
        }

        const player = createAudioPlayer();
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', (err) => {
            console.error("Erreur Player:", err);
            connection.destroy();
        });

    } catch (e) {
        message.reply("Erreur : " + e.message);
    }
});

client.login(process.env.DISCORD_TOKEN);
