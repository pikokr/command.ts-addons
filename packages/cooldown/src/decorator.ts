import { CommandClient, createComponentHook } from '@pikokr/command.ts'
import {
  ApplicationCommandType,
  BaseInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  Message,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js'
import { CooldownError } from './error'
import { getStore } from './store'
import { CooldownType } from './types'

/**
 * Cooldown decorator
 * @param type CooldownType
 * @param time Cooldown time in milliseconds
 * @returns {MethodDecorator}
 */
export const cooldown = (type: CooldownType, time: number) =>
  createComponentHook(
    'beforeCall',
    async (client: CommandClient, arg: unknown) => {
      let key: string | null = null

      if (arg instanceof CommandInteraction) {
        if (arg.commandType === ApplicationCommandType.ChatInput) {
          const i = arg as ChatInputCommandInteraction
          key = `interaction.applicationCommand.${arg.commandType}.${
            arg.commandName
          }.${i.options.getSubcommandGroup(false)}.${i.options.getSubcommand(
            false
          )}`
        } else {
          key = `interaction.applicationCommand.${arg.commandType}.${arg.commandName}`
        }
      } else if (arg instanceof MessageComponentInteraction) {
        key = `interaction.messageComponent.${arg.componentType}.${arg.customId}`
      } else if (arg instanceof ModalSubmitInteraction) {
        key = `interaction.modalSubmit.${arg.customId}`
      }

      if (arg instanceof Message) {
        key = `message.${arg.command.options.name}`
      }

      if (!key) throw new Error('Cooldown of this component is not supported')

      if (arg instanceof BaseInteraction) {
        switch (type) {
          case CooldownType.User:
            key += `.user.${arg.user.id}`
            break
          case CooldownType.Guild:
            if (!arg.guildId)
              throw new Error('Cannot use guild cooldown on direct messages')
            key += `.guild.${arg.guildId}`
            break
          case CooldownType.Channel:
            key += `.channel.${arg.channelId}`
            break
        }
      } else if (arg instanceof Message) {
        switch (type) {
          case CooldownType.User:
            key += `.user.${arg.author.id}`
            break
          case CooldownType.Guild:
            if (!arg.guildId)
              throw new Error('Cannot use guild cooldown on direct messages')
            key += `.guild.${arg.guildId}`
            break
          case CooldownType.Channel:
            key += `.channel.${arg.channelId}`
            break
        }
      } else {
        throw new Error('Cooldown of this component is not supported')
      }

      const store = getStore()

      const value = await store.get(key)

      if (value) {
        const now = Date.now()
        if (now < value) {
          throw new CooldownError(value)
        }
      }

      await store.set(key, Date.now() + time)
    }
  )
