const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

client.once('ready', () => {
    console.log(`Robot connecté sous le tag ${client.user.tag} !`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!dis')) return;

    const args = message.content.slice(4).trim();
    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel) return message.reply("Tu dois être dans un salon vocal !");

    const url = googleTTS.getAudioUrl(args, { lang: 'fr', slow: false });
    
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    
    const resource = createAudioResource(url);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });
});

client.login(process.env.DISCORD_TOKEN);
