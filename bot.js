const fs = require("fs");
const Discord = require("discord.js");
const { Client, Util } = require("discord.js");
const client = new Discord.Client();
const db = require("quick.db");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const { GiveawaysManager } = require('discord-giveaways');
const ayarlar = require("./ayarlar.json");
const express = require("express");


/////
const app = express();
app.get("/", (req, res) =>
  res.send("yDarK Bot Aktif | Discord = https://discord.gg/tDpq2SAEF4")
);
app.listen(process.env.PORT, () =>
  console.log("Port ayarlandı: " + process.env.PORT)
);
//////////////////////////////////////////////////////////////

//------------------Değişen Oynuyor---------------------------\\





client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(" ")[0].slice(ayarlar.prefix.length);
  let params = message.content.split(" ").slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
});



//-------------Bot Eklenince Bir Kanala Mesaj Gönderme Komutu ---------------\\

const embed = new Discord.MessageEmbed()
.setThumbnail()
.setColor('GREEN')
.addField(`yDarKDayS | Hey`, `\<a:Ykalp:846249823833554955> **Selamlar, Ben YUSUŦ ΞЛΞS Öncelikle yDarK BOT u Tercih Ettiğiniz İçin Teşşekür Ederim** \<a:Ykalp:846249823833554955>`)
.addField(`yDarKDayS | BILGI`, `yDarK BOT **Uptime** | **Eğlence** | **Moderasyon** | **Şarkı** ve Daha Fazla Katagorisiyle Karşınızdadır...`)
.setFooter(`yDarKDayS | 2021`)
.setTimestamp();




client.on("guildCreate", guild => {

let defaultChannel = "";
guild.channels.cache.forEach((channel) => {
if(channel.type == "text" && defaultChannel == "") {
if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
defaultChannel = channel;
}
}
})

defaultChannel.send(embed)

});



//----------------------------------------------------------------\\

client.on("message", async message => {

  if (message.author.bot) return;

  if (!message.guild) return;

  let prefix = db.get(`prefix_${message.guild.id}`);

  if (prefix === null) prefix = prefix;

  if (!message.content.startsWith(prefix)) return;

  if (!message.member)

  message.member = await message.guild.fetchMember(message);

  const args = message.content

    .slice(prefix.length)

    .trim()

    .split(/ +/g);

  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;
  
  let command = client.commands.get(cmd);

  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) command.run(client, message, args);

});


//////////////////////////MODLOG///////////////////

//////////////////////////////MODLOG///////////////////////////


//Muteliyken sw den çıkana mute
client.on('guildMemberAdd', async(member) => {
  let mute = db.fetch(`muterol_${member.guild.id}`);
  let mutelimi = db.fetch(`muteli_${member.guild.id + member.id}`)
  if (!mutelimi) return;
  if (mutelimi == "muteli") {
  member.roles.add(mute)
   member.send("Muteliyken Sunucudan Çıktığın için Yeniden Mutelendin!")
       const modlog = db.fetch(`modlogKK_${member.guild.id}`)
    if (!modlog) return;
     db.delete(`muteli_${member.guild.id + member.id}`)
        const embed = new Discord.MessageEmbed()
      .setThumbnail(member.avatarURL())
      .setColor(0x00AE86)
      .setTimestamp()
      .addField('Eylem:', '**Mute**')
      .addField('Kullanıcı:', `${member} (${member.id})`)
      .addField('Yetkili:', `${client.user} (${client.user.id})`)
      .addField('Süre', "Sonsuz")
      .addField('Sebep', "Muteliyken Sunucudan Çıkmak.")
     member.guild.channels.cache.get(modlog).send(embed);
  }
  })
  //Muteliyken sw den çıkana mute

client.on('message', msg => {
  client.emit('checkMessage', msg); 
})





const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.yetkiler = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = -ayarlar.varsayilanperm;
  if (message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if (message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if (message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if (message.author.id === message.guild.ownerID) permlvl = 6;
  if (message.author.id === ayarlar.sahip) permlvl = 7;
  return permlvl;
};



//////////////////////////////////////////////////




//////çekiliş/////////..



client.login(process.env.token);

client.on('message', msg => {
  
  var cevap = [
    
    "Aleyküm Selam Kardeşim",
    "\<:Aas:758613884403449876>",
    "Ve aleyküm selam ve rahmetullahi ve berekatü"
];

var cevaplar = cevap[Math.floor(Math.random() * cevap.length)];



  let deneme1 = msg.content.toLowerCase()
  if (deneme1 === 'sa' || deneme1 === 'Sa' || deneme1 === 'sea' ) {
  msg.channel.send(`${cevaplar}`)
  
     }
  })

//--------------------------------KOMUTLAR-------------------------------\\

/////////küfür engel


/////////napim engel

///reklamengel



///KOD EKLEME KALDIRMA 
const prefix = '!';

let commands = {}; // Komutları depolamak için bir nesne

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı.`);
  // Bot başladığında komutları yükle
  refreshCommands();
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'add') {
    const fileName = args.shift();
    const code = args.join(' ');

    fs.writeFile(`komutlar/${fileName}.js`, code, (err) => {
      if (err) {
        message.channel.send('Dosya kaydedilirken bir hata oluştu.');
        console.error(err);
      } else {
        message.channel.send(`\`${fileName}.js\` adlı dosya başarıyla kaydedildi.`);
        // Komutları güncelle
        refreshCommands();
      }
    });
  } else if (command === 'delete') {
    const fileName = args.shift();

    fs.unlink(`komutlar/${fileName}.js`, (err) => {
      if (err) {
        message.channel.send('Dosya silinirken bir hata oluştu veya dosya bulunamadı.');
        console.error(err);
      } else {
        message.channel.send(`\`${fileName}.js\` adlı dosya başarıyla silindi.`);
        // Komutları güncelle
        refreshCommands();
      }
    });
  } else if (command === 'list') {
    listCommands(message);
  } else if (command === 'update') {
    const fileName = args.shift();
    const code = args.join(' ');

    fs.writeFile(`komutlar/${fileName}.js`, code, (err) => {
      if (err) {
        message.channel.send('Dosya güncellenirken bir hata oluştu.');
        console.error(err);
      } else {
        message.channel.send(`\`${fileName}.js\` adlı dosya başarıyla güncellendi.`);
        // Komutları güncelle
        refreshCommands();
      }
    });
  } else if (command === 'show') {
    const fileName = args.shift();

    fs.readFile(`komutlar/${fileName}.js`, 'utf-8', (err, data) => {
      if (err) {
        message.channel.send('Dosya okunurken bir hata oluştu veya dosya bulunamadı.');
        console.error(err);
      } else {
        // Mesajı harf sınırını ve ``` ile bölerek gönder
        const codeChunks = splitCodeChunks(data, 2000);
        codeChunks.forEach((chunk) => {
          message.channel.send(`\`\`\`${chunk}\`\`\``);
        });
      }
    });
  }
});

function splitCodeChunks(code, limit) {
  const chunks = [];
  while (code.length > limit) {
    const chunk = code.substring(0, limit);
    chunks.push(chunk);
    code = code.slice(limit);
  }
  chunks.push(code);
  return chunks;
}


function listCommands(message) {
  const commandList = Object.keys(commands).join(', ');
  const mevcutk = new Discord.MessageEmbed()
.setThumbnail()
.setColor('RED')
.setDescription(`**Mevcut Komutlar:** \n\n> ||**${commandList}**||`)
.setFooter(`Mr & Bexy`)
.setTimestamp();



message.channel.send(mevcutk);
}

function refreshCommands() {
  // "komutlar" klasöründeki dosyaları okuyarak komutları güncelle
  fs.readdir('komutlar', (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    // Yeni komutları "commands" nesnesine ekleyin
    const newCommands = {};
    files.forEach((file) => {
      const commandName = file.replace('.js', '');
      newCommands[commandName] = require(`./komutlar/${file}`);
    });

    // Komutları güncelle
    commands = newCommands;
    console.log('Komutlar güncellendi.');
  });
}

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'refresh') {
    // Botu yeniden başlat
    message.channel.send('Bot yeniden başlatılıyor...').then(() => {
      process.exit();
    });
  }
});
/// KOD EKLEME KALDIRMA

/// OZEL DURUM AYARI
const PREFIX = '!'; // Değiştirmek istediğiniz komut öneği
let STATUS_INTERVAL = 30 * 1000; // Başlangıçta 30 saniyede bir özel durumu değiştir

let customStatuses = []; // Eklenen özel durumları tutacak dizi
let currentIndex = 0; // Şu anki özel durumun dizideki indeksi

let defaultActivity = { type: 'WATCHING', name: 'Bir şeyler' }; // Varsayılan aktivite

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
  setCustomStatus(); // Bot başladığında özel durumu ayarla
  setInterval(changeStatus, STATUS_INTERVAL); // Özel durumu periyodik olarak değiştir
});

client.on('message', (message) => {
  if (message.author.bot) return; // Botun kendi mesajlarını işleme
  if (message.content.startsWith(`${PREFIX}addstatus`)) {
    // Özel durumu eklemek için komut
    const newStatus = message.content.slice(`${PREFIX}addstatus`.length).trim();
    customStatuses.push(newStatus);
    message.channel.send(`Özel durum başarıyla eklendi: ${newStatus}`);
  } else if (message.content.startsWith(`${PREFIX}liststatuses`)) {
    // Eklenen özel durumları listelemek için komut
    const statusList = customStatuses.map((status, index) => `Eklenme Numarası: ${index + 1}\nÖzel Durum: ${status}`).join('\n\n');
    message.channel.send('Eklenen Özel Durumlar:\n\n' + statusList);
  } else if (message.content.startsWith(`${PREFIX}deletestatus`)) {
    // Özel durumu kaldırmak için komut
    const indexToRemove = parseInt(message.content.slice(`${PREFIX}deletestatus`.length).trim()) - 1;
    if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < customStatuses.length) {
      const removedStatus = customStatuses.splice(indexToRemove, 1)[0];
      message.channel.send(`Özel durum başarıyla kaldırıldı: ${removedStatus}`);
    } else {
      message.channel.send('Geçersiz bir özel durum numarası girdiniz.');
    }
  } else if (message.content.startsWith(`${PREFIX}setactivity`)) {
    // Aktiviteyi değiştirmek için komut
    const args = message.content.slice(`${PREFIX}setactivity`.length).trim().split(' ');
    const activityType = args[0].toLowerCase(); // İlk argüman aktivite türünü belirtir (örneğin: oynuyor, izliyor, dinliyor, yayında)
    const activityText = args.slice(1).join(' '); // Aktivite metni

    if (activityText) {
      let activity;
      switch (activityType) {
        case 'oynuyor':
          activity = { type: 'PLAYING', name: activityText };
          break;
        case 'izliyor':
          activity = { type: 'WATCHING', name: activityText };
          break;
        case 'dinliyor':
          activity = { type: 'LISTENING', name: activityText };
          break;
        case 'yayında':
          activity = { type: 'STREAMING', name: activityText, url: 'https://twitch.tv/elraenn' }; // Twitch yayın URL'sini buraya ekleyin
          break;
        default:
          message.channel.send('Geçersiz aktivite türü. Lütfen "oynuyor", "izliyor", "dinliyor" veya "yayında" kullanın.');
          return;
      }

      client.user.setActivity(activity.name, { type: activity.type, url: activity.url });
      message.channel.send(`Aktivite başarıyla güncellendi: ${activityText} ${activityType}`);
    } else {
      message.channel.send('Aktivite metni belirtmediniz. Lütfen aktiviteyi ve metni belirtin.');
    }
  } else if (message.content.startsWith(`${PREFIX}setinterval`)) {
    // Özel durum değişim aralığını ayarlamak için komut
    const newInterval = parseInt(message.content.slice(`${PREFIX}setinterval`.length).trim()) * 1000;
    if (!isNaN(newInterval) && newInterval >= 5000) { // Minimum 5 saniye olarak ayarlayabilirsiniz
      STATUS_INTERVAL = newInterval;
      clearInterval(changeStatus); // Eski interval'ı temizle
      setInterval(changeStatus, STATUS_INTERVAL); // Yeni interval'ı ayarla
      message.channel.send(`Özel durum değişim aralığı ${newInterval / 1000} saniyeye ayarlandı.`);
    } else {
      message.channel.send('Geçersiz bir değişim aralığı girdiniz veya minimum 5 saniye olmalı.');
    }
  }
});

function setCustomStatus() {
  if (customStatuses.length > 0) {
    client.user.setPresence({
      activity: {
        name: customStatuses[currentIndex],
        type: 'PLAYING', // Oynuyor olarak ayarlayabilirsiniz, diğer seçenekler de mevcut
      },
    });
  }
}

function changeStatus() {
  if (customStatuses.length > 0) {
    currentIndex = (currentIndex + 1) % customStatuses.length;
    setCustomStatus();
  }
}
/// ÖZEL DURUM AYARI

/// SORU CVP
//let messageCounter = 0;
//let messageLog = new Map();
//
//client.on("ready", () => {
//    console.log("soru cevap hazır kanki!");
//});
//
//client.on("message", message => {
//    if (message.channel.type === "dm" && !message.author.bot) {
//        messageCounter++;
//        messageLog.set(messageCounter, {
//            author: message.author,
//            content: message.content
//        });
//        client.channels.cache.get("1077616626649800829").send(`Sıra numarası: **${messageCounter}**\nGönderen: **${message.author.tag}.     / **${message.author.id}**\nMesaj: **${message.content}**`);
//        message.author.send(`Mesajınız yetkili ekibine iletildi, lütfen sıra numaranızı saklayın. **${messageCounter}**`);
//    }
//
//    if (message.content.startsWith("!yanıtla")) {
//        let args = message.content.split(" ");
//        let messageNum = parseInt(args[1]);
//        let response = args.slice(2).join(" ");
//        if (!response) return message.channel.send("Lütfen geçerli bir yanıt yazın.");
//        if (!messageLog.has(messageNum)) return message.channel.send("Geçersiz sıra numarası.");
//
//        let targetUser = messageLog.get(messageNum).author;
//        targetUser.send(`Yanıtlayan Yetkili: **${message.author.username}**\nSıra numarası: **${messageNum}**\nYetkili Kişinin Yanıtı: **${response}**`);
//        message.channel.send(`Yanıt iletildi ${message.author.username}!\n`);
//    }
//});
/// SORU CVP

/// mesajlaşma
const Prefix = "!"; // Prefix büyük harfle yazıldı.

client.on("message", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(Prefix + "sohbet")) {
    const args = message.content.slice(Prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const targetUser = message.mentions.users.first();

    if (!targetUser) {
      message.channel.send("Lütfen bir kullanıcıyı etiketleyin.");
      return;
    }

    const user1 = message.author;
    const user2 = targetUser;

    user1.send(`${user2.username} ile konuşmak ister misin? (👍/👎)`).then(async (questionMessage) => {
      await questionMessage.react("👍");
      await questionMessage.react("👎");

      const filter = (reaction, user) =>
        ["👍", "👎"].includes(reaction.emoji.name) && user.id === user1.id;

      const collector = questionMessage.createReactionCollector(filter, {
        time: 60000, // 60 saniye içinde tepki vermeliler
        max: 3, // 3 kapatma komutu kabul edilebilir
      });

      let conversationActive = true;

      collector.on("collect", async (reaction, user) => {
        if (reaction.emoji.name === "👍") {
          user1.send(`Konuşma başlatıldı. Mesaj yazmaya başlayabilirsiniz.`);
          user2.send(`Konuşma başlatıldı. Mesaj yazmaya başlayabilirsiniz.`);
        } else if (reaction.emoji.name === "👎") {
          message.channel.send(`${user2.username} mesaj isteğinizi reddetti.`);
          collector.stop();
        }
      });

      collector.on("end", (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
          message.channel.send(`${user2.username} zaman aşımına uğradı.`);
        } else if (collected.size === 3) {
          message.channel.send(`${user1.username} ve ${user2.username} üç kez kapatma komutunu kabul etti.`);
          conversationActive = false;
        }
      });

      // İki tarafın özel mesajlarından gelen mesajları işlemlemek için bir dinleyici eklemeyi unutmayın.
      client.on("message", async (userMessage) => {
        if (conversationActive && userMessage.author.id === user1.id) {
          user2.send(`${user1.username}: ${userMessage.content}`);
        } else if (conversationActive && userMessage.author.id === user2.id) {
          user1.send(`${user2.username}: ${userMessage.content}`);
        }
      });
    });
  }
});
/// mesajlaşma

// Botu her belirli bir süre (örneğin, 30 dakika) sonra tekrar başlatmak için setInterval kullanın
const delayMs = 4 * 60 * 1000; // 30 dakika (milisaniye cinsinden)
setInterval(() => {
  // Botu yeniden başlatma kodu buraya gelecek
  // Örneğin: client.destroy(); client.login('TOKEN');
}, delayMs);