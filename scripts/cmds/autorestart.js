const { resolve } = require('path');
const fs = require('fs-extra');
const os = require('os');

let isAutoRestartEnabled = false;
let restartIntervalId;

module.exports = {
  config: {
    name: 'autorestart',
    aliases: [],
    author: 'SKY',
    version: '1.0',
    role: 2, // Set the required role (e.g., admin)
    shortDescription: {
      en: 'Enable or disable auto restart',
    },
    longDescription: {
      en: 'Enable or disable auto restart every 10 minutes',
    },
    category: 'owner',
    guide: {
      en: '{p}autorestart on / off',
    },
  },

  onStart: async function ({ api, event, args }) {
    const command = args[0];

    if (command === 'on') {
      if (isAutoRestartEnabled) {
        api.sendMessage('Auto restart is already enabled.', event.threadID);
      } else {
        isAutoRestartEnabled = true;
        api.sendMessage('Auto restart is now enabled. Bot will restart every 50 minutes.', event.threadID);
        startAutoRestart(api, event.threadID);
      }
    } else if (command === 'off') {
      if (!isAutoRestartEnabled) {
        api.sendMessage('Auto restart is already disabled.', event.threadID);
      } else {
        isAutoRestartEnabled = false;
        clearInterval(restartIntervalId);
        api.sendMessage('Auto restart is now disabled.', event.threadID);
      }
    } else {
      api.sendMessage('Please type `{p}autorestart on` to start, and `{p}autorestart off` to stop.', event.threadID);
    }
  },
};

function startAutoRestart(api, threadID) {
  restartIntervalId = setInterval(() => {
    restartBot(api, threadID);
  }, 50 * 60 * 5000); // Restart every 50 minutes
}

function restartBot(api, threadID) {
  const restartMessage = '🔄 | Restarting bot...';
  api.sendMessage(restartMessage, threadID);

  // Assuming your bot is running through PM2, replace 'YourBotName' with your actual bot name.
  const botName = '𝐽𝐴𝑌𝐷𝐸𝑁 𝐵𝑂𝑇';
  const restartCommand = `pm2 restart ${botName}`;

  // Execute the restart command
  const { exec } = require('child_process');
  exec(restartCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting bot: ${error}`);
      api.sendMessage(`Error restarting bot: ${error}`, threadID);
    }
  });
}