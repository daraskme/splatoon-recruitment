import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } from 'discord.js';

let discordClient: Client | null = null;

export async function getDiscordClient(): Promise<Client> {
  if (discordClient && discordClient.isReady()) {
    return discordClient;
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  await discordClient.login(process.env.DISCORD_BOT_TOKEN);

  return discordClient;
}

export async function createVoiceChannel(roomTitle: string): Promise<{ channelId: string; inviteUrl: string }> {
  const client = await getDiscordClient();
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!);

  const categoryId = process.env.DISCORD_CATEGORY_ID;

  const channel = await guild.channels.create({
    name: roomTitle,
    type: ChannelType.GuildVoice,
    parent: categoryId,
    userLimit: 4,
  });

  const invite = await channel.createInvite({
    maxAge: 0, // Never expires
    maxUses: 0, // Unlimited uses
  });

  return {
    channelId: channel.id,
    inviteUrl: invite.url,
  };
}

export async function deleteVoiceChannel(channelId: string): Promise<void> {
  try {
    const client = await getDiscordClient();
    const channel = await client.channels.fetch(channelId);

    if (channel && channel.type === ChannelType.GuildVoice) {
      await channel.delete();
    }
  } catch (error) {
    console.error('Failed to delete voice channel:', error);
  }
}

export async function checkVoiceChannelEmpty(channelId: string): Promise<boolean> {
  try {
    const client = await getDiscordClient();
    const channel = await client.channels.fetch(channelId);

    if (channel && channel.type === ChannelType.GuildVoice) {
      return channel.members.size === 0;
    }

    return true;
  } catch (error) {
    console.error('Failed to check voice channel:', error);
    return true;
  }
}
