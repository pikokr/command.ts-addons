import 'dotenv/config'
import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  CommandInteraction,
} from 'discord.js'
import {
  applicationCommand,
  CommandClient,
  Extension,
  listener,
} from '@pikokr/command.ts'
import { cooldown, CooldownError, CooldownType } from '../src'

const client = new Client({
  intents: [],
})

const cts = new CommandClient(client)

class TestModule extends Extension {
  @applicationCommand({
    type: ApplicationCommandType.ChatInput,
    name: '테스트',
    description: 'test',
  })
  @cooldown(CooldownType.User, 1000 * 10)
  async test(i: ChatInputCommandInteraction) {
    i.reply('test')
  }

  @listener({ event: 'applicationCommandInvokeError', emitter: 'cts' })
  async error(e: Error, i: CommandInteraction) {
    if (e instanceof CooldownError) {
      return i.reply({
        content: `쿨타임이 ${((e.endsAt - Date.now()) / 1000).toFixed(
          1
        )}초 남았습니다.`,
        ephemeral: true,
      })
    }

    console.error(e)
  }
}

setImmediate(async () => {
  await cts.enableApplicationCommandsExtension({
    guilds: [process.env.GUILD!],
  })

  await cts.registry.registerModule(new TestModule())

  await client.login(process.env.TOKEN)

  await cts.fetchOwners()

  await cts.getApplicationCommandsExtension()!.sync()
})
