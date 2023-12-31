import axios from 'axios'

import { EmbedBuilder, type GuildTextBasedChannel } from 'discord.js'
import { type Client } from '../shared/interfaces'
import { runAtTime } from '../util/functions.util'

export async function ClientReadyEvent (client: Client<true>): Promise<void> {
  runAtTime('12:00 AM', async () => {
    console.log('\nRunning the word of the day!')
    const guild = await client.guilds.fetch(process.env.guild_id ?? '')
    if (guild == null) return
    const channel = await guild.channels.fetch(process.env.wotd_channel ?? '') as GuildTextBasedChannel
    if (channel == null) return

    axios.request({
      method: 'GET',
      url: `https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${process.env.wordnik_api_key ?? ''}`
    }).then(async function ({ data }: { data: { word: string, note: string, definitions: [{ text: string }], examples: [{ text: string }] } }) {
      const wotdEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Word of the day')
        .setDescription(`The word of the day is \`${data.word}\`.`)
        .addFields(
          { name: 'Definition', value: `\`${data.definitions[0].text}\`` },
          { name: 'Example', value: `\`${data.examples[0].text}\`` }
        )
        .setFooter({ text: data.note })

      await channel.send({ embeds: [wotdEmbed] })
    }).catch(function (error: any) { console.error(error) })
  })
  console.log('Ready!')
}
