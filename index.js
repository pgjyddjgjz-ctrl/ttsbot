const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const http = require('http');

http.createServer((req, res) => {
    res.end('Bot actif');
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!dis')) return;

    const args = message.content.slice(4).trim();
    if (!args) return message.reply("Écris un texte après !dis");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Rejoins un salon vocal !");

    try {
        const url = googleTTS.getAudioUrl(args, { lang: 'fr', slow: false });
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', () => {
            connection.destroy();
        });

        await message.react('✅');
    } catch (e) {
        message.reply("Erreur audio.");
    }
});

client.login(process.env.DISCORD_TOKEN);
