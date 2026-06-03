const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const discordTTS = require('discord-tts');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!dis')) return;
    const text = message.content.slice(4).trim();
    const channel = message.member?.voice.channel;
    if (!channel) return;

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    // Cette méthode est plus robuste pour Discord
    const stream = discordTTS.getVoiceStream(text);
    const resource = createAudioResource(stream, { inputType: 0 });
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
});

client.login(process.env.DISCORD_TOKEN);
