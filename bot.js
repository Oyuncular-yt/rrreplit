const fs = require("fs");
const Discord = require("discord.js");
const { Client, Util } = require("discord.js");
const client = new Discord.Client();
const db = require("quick.db");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const { GiveawaysManager } = require("discord-giveaways");
const ayarlar = require("./ayarlar.json");
const express = require("express");
const ms = require('ms'); // Süreleri kolayca hesaplamak için ms modülünü kullan
const axios = require('axios');

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

client.on("message", (message) => {
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
  .setColor("GREEN")
  .addField(
    `yDarKDayS | Hey`,
    `\<a:Ykalp:846249823833554955> **Selamlar, Ben YUSUŦ ΞЛΞS Öncelikle yDarK BOT u Tercih Ettiğiniz İçin Teşşekür Ederim** \<a:Ykalp:846249823833554955>`
  )
  .addField(
    `yDarKDayS | BILGI`,
    `yDarK BOT **Uptime** | **Eğlence** | **Moderasyon** | **Şarkı** ve Daha Fazla Katagorisiyle Karşınızdadır...`
  )
  .setFooter(`yDarKDayS | 2021`)
  .setTimestamp();

client.on("guildCreate", (guild) => {
  let defaultChannel = "";
  guild.channels.cache.forEach((channel) => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });

  defaultChannel.send(embed);
});

//----------------------------------------------------------------\\

client.on("message", async (message) => {
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
client.on("guildMemberAdd", async (member) => {
  let mute = db.fetch(`muterol_${member.guild.id}`);
  let mutelimi = db.fetch(`muteli_${member.guild.id + member.id}`);
  if (!mutelimi) return;
  if (mutelimi == "muteli") {
    member.roles.add(mute);
    member.send("Muteliyken Sunucudan Çıktığın için Yeniden Mutelendin!");
    const modlog = db.fetch(`modlogKK_${member.guild.id}`);
    if (!modlog) return;
    db.delete(`muteli_${member.guild.id + member.id}`);
    const embed = new Discord.MessageEmbed()
      .setThumbnail(member.avatarURL())
      .setColor(0x00ae86)
      .setTimestamp()
      .addField("Eylem:", "**Mute**")
      .addField("Kullanıcı:", `${member} (${member.id})`)
      .addField("Yetkili:", `${client.user} (${client.user.id})`)
      .addField("Süre", "Sonsuz")
      .addField("Sebep", "Muteliyken Sunucudan Çıkmak.");
    member.guild.channels.cache.get(modlog).send(embed);
  }
});
//Muteliyken sw den çıkana mute

client.on("message", (msg) => {
  client.emit("checkMessage", msg);
});

const log = (message) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach((f) => {
    let props = require(`./komutlar/${f}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = (command) => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = (command) => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = (command) => {
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

client.yetkiler = (message) => {
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

client.on("message", (msg) => {
  var cevap = [
    "Aleyküm Selam Kardeşim",
    "<:Aas:758613884403449876>",
    "Ve aleyküm selam ve rahmetullahi ve berekatü",
  ];

  var cevaplar = cevap[Math.floor(Math.random() * cevap.length)];

  let deneme1 = msg.content.toLowerCase();
  if (deneme1 === "sa" || deneme1 === "Sa" || deneme1 === "sea") {
    msg.channel.send(`${cevaplar}`);
  }
});

//--------------------------------KOMUTLAR-------------------------------\\

/////////küfür engel

/////////napim engel

///reklamengel

///KOD EKLEME KALDIRMA
const prefix = "!";

let commands = {}; // Komutları depolamak için bir nesne

client.on("ready", () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı.`);
  // Bot başladığında komutları yükle
  refreshCommands();
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "add") {
    const fileName = args.shift();
    const code = args.join(" ");

    fs.writeFile(`komutlar/${fileName}.js`, code, (err) => {
      if (err) {
        message.channel.send("Dosya kaydedilirken bir hata oluştu.");
        console.error(err);
      } else {
        message.channel.send(
          `\`${fileName}.js\` adlı dosya başarıyla kaydedildi.`
        );
        // Komutları güncelle
        refreshCommands();
      }
    });
  } else if (command === "delete") {
    const fileName = args.shift();

    fs.unlink(`komutlar/${fileName}.js`, (err) => {
      if (err) {
        message.channel.send(
          "Dosya silinirken bir hata oluştu veya dosya bulunamadı."
        );
        console.error(err);
      } else {
        message.channel.send(
          `\`${fileName}.js\` adlı dosya başarıyla silindi.`
        );
        // Komutları güncelle
        refreshCommands();
      }
    });
  } else if (command === "list") {
    listCommands(message);
  } else if (command === "update") {
    const fileName = args.shift();
    const code = args.join(" ");

    fs.writeFile(`komutlar/${fileName}.js`, code, (err) => {
      if (err) {
        message.channel.send("Dosya güncellenirken bir hata oluştu.");
        console.error(err);
      } else {
        message.channel.send(
          `\`${fileName}.js\` adlı dosya başarıyla güncellendi.`
        );
        // Komutları güncelle
        refreshCommands();
      }
    });
  } else if (command === "show") {
    const fileName = args.shift();

    fs.readFile(`komutlar/${fileName}.js`, "utf-8", (err, data) => {
      if (err) {
        message.channel.send(
          "Dosya okunurken bir hata oluştu veya dosya bulunamadı."
        );
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
  const commandList = Object.keys(commands).join(", ");
  const mevcutk = new Discord.MessageEmbed()
    .setThumbnail()
    .setColor("RED")
    .setDescription(`**Mevcut Komutlar:** \n\n> ||**${commandList}**||`)
    .setFooter(`Mr & Bexy`)
    .setTimestamp();

  message.channel.send(mevcutk);
}

function refreshCommands() {
  // "komutlar" klasöründeki dosyaları okuyarak komutları güncelle
  fs.readdir("komutlar", (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    // Yeni komutları "commands" nesnesine ekleyin
    const newCommands = {};
    files.forEach((file) => {
      const commandName = file.replace(".js", "");
      newCommands[commandName] = require(`./komutlar/${file}`);
    });

    // Komutları güncelle
    commands = newCommands;
    console.log("Komutlar güncellendi.");
  });
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "refresh") {
    // Botu yeniden başlat
    message.channel.send("Bot yeniden başlatılıyor...").then(() => {
      process.exit();
    });
  }
});
/// KOD EKLEME KALDIRMA

/// OZEL DURUM AYARI
const PREFIX = "!"; // Değiştirmek istediğiniz komut öneği
let STATUS_INTERVAL = 30 * 1000; // Başlangıçta 30 saniyede bir özel durumu değiştir

let customStatuses = []; // Eklenen özel durumları tutacak dizi
let currentIndex = 0; // Şu anki özel durumun dizideki indeksi

let defaultActivity = { type: "WATCHING", name: "Bir şeyler" }; // Varsayılan aktivite

client.on("ready", () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
  setCustomStatus(); // Bot başladığında özel durumu ayarla
  setInterval(changeStatus, STATUS_INTERVAL); // Özel durumu periyodik olarak değiştir
});

client.on("message", (message) => {
  if (message.author.bot) return; // Botun kendi mesajlarını işleme
  if (message.content.startsWith(`${PREFIX}addstatus`)) {
    if (message.author.id === '699050343425') {
    // Özel durumu eklemek için komut
    const newStatus = message.content.slice(`${PREFIX}addstatus`.length).trim();
    customStatuses.push(newStatus);
    message.channel.send(`Özel durum başarıyla eklendi: ${newStatus}`);
  } else if (message.content.startsWith(`${PREFIX}liststatuses`)) {
    // Eklenen özel durumları listelemek için komut
    const statusList = customStatuses
      .map(
        (status, index) =>
          `Eklenme Numarası: ${index + 1}\nÖzel Durum: ${status}`
      )
      .join("\n\n");
    message.channel.send("Eklenen Özel Durumlar:\n\n" + statusList);
  } else if (message.content.startsWith(`${PREFIX}deletestatus`)) {
    if (message.author.id === '699050343425') {
    // Özel durumu kaldırmak için komut
    const indexToRemove =
      parseInt(message.content.slice(`${PREFIX}deletestatus`.length).trim()) -
      1;
    if (
      !isNaN(indexToRemove) &&
      indexToRemove >= 0 &&
      indexToRemove < customStatuses.length
    ) {
      const removedStatus = customStatuses.splice(indexToRemove, 1)[0];
      message.channel.send(`Özel durum başarıyla kaldırıldı: ${removedStatus}`);
    } else {
      message.channel.send("Geçersiz bir özel durum numarası girdiniz.");
    }
  } else if (message.content.startsWith(`${PREFIX}setactivity`)) {
    if (message.author.id === '699050343425') {
    // Aktiviteyi değiştirmek için komut
    const args = message.content
      .slice(`${PREFIX}setactivity`.length)
      .trim()
      .split(" ");
    const activityType = args[0].toLowerCase(); // İlk argüman aktivite türünü belirtir (örneğin: oynuyor, izliyor, dinliyor, yayında)
    const activityText = args.slice(1).join(" "); // Aktivite metni

    if (activityText) {
      let activity;
      switch (activityType) {
        case "oynuyor":
          activity = { type: "PLAYING", name: activityText };
          break;
        case "izliyor":
          activity = { type: "WATCHING", name: activityText };
          break;
        case "dinliyor":
          activity = { type: "LISTENING", name: activityText };
          break;
        case "yayında":
          activity = {
            type: "STREAMING",
            name: activityText,
            url: "https://twitch.tv/elraenn",
          }; // Twitch yayın URL'sini buraya ekleyin
          break;
        default:
          message.channel.send(
            'Geçersiz aktivite türü. Lütfen "oynuyor", "izliyor", "dinliyor" veya "yayında" kullanın.'
          );
          return;
      }

      client.user.setActivity(activity.name, {
        type: activity.type,
        url: activity.url,
      });
      message.channel.send(
        `Aktivite başarıyla güncellendi: ${activityText} ${activityType}`
      );
    } else {
      message.channel.send(
        "Aktivite metni belirtmediniz. Lütfen aktiviteyi ve metni belirtin."
      );
    }
  } else if (message.content.startsWith(`${PREFIX}setinterval`)) {
    if (message.author.id === '699050343425') {
    // Özel durum değişim aralığını ayarlamak için komut
    const newInterval =
      parseInt(message.content.slice(`${PREFIX}setinterval`.length).trim()) *
      1000;
    if (!isNaN(newInterval) && newInterval >= 5000) {
      // Minimum 5 saniye olarak ayarlayabilirsiniz
      STATUS_INTERVAL = newInterval;
      clearInterval(changeStatus); // Eski interval'ı temizle
      setInterval(changeStatus, STATUS_INTERVAL); // Yeni interval'ı ayarla
      message.channel.send(
        `Özel durum değişim aralığı ${newInterval / 1000} saniyeye ayarlandı.`
      );
    } else {
      message.channel.send(
        "Geçersiz bir değişim aralığı girdiniz veya minimum 5 saniye olmalı."
      );
    }
    }
  }
  }
    }
  }
});

function setCustomStatus() {
  if (customStatuses.length > 0) {
    client.user.setPresence({
      activity: {
        name: customStatuses[currentIndex],
        type: "PLAYING", // Oynuyor olarak ayarlayabilirsiniz, diğer seçenekler de mevcut
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

    user2
      .send(`${user1.username} ile konuşmak ister misin? (👍/👎)`)
      .then(async (questionMessage) => {
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
            user1.send(
              `**${user2.username}** ile konuşma başlatıldı. Mesaj yazmaya başlayabilirsiniz.`
            );
            user2.send(
              `**${user1.username}** ile konuşma başlatıldı. Mesaj yazmaya başlayabilirsiniz.`
            );
          } else if (reaction.emoji.name === "👎") {
            message.channel.send(
              `${user2.username} mesaj isteğinizi reddetti.`
            );
            collector.stop();
          }
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time" && collected.size === 0) {
            message.channel.send(
              `${user2.username} zaman aşımına uğradı.`
            );
          } else if (collected.size === 3) {
            message.channel.send(
              `${user1.username} ve ${user2.username} üç kez kapatma komutunu kabul etti.`
            );
            conversationActive = false;
          }
        });

        // İki tarafın özel mesajlarından gelen mesajları işlemlemek için bir dinleyici eklemeyi unutmayın.
        client.on("message", async (userMessage) => {
          if (conversationActive && userMessage.author.id === user1.id) {
            user1.send(`**${user2.username}:** ${userMessage.content}`);
          } else if (conversationActive && userMessage.author.id === user2.id) {
            user2.send(`**${user1.username}:** ${userMessage.content}`);
          }
        });
      });
  }
});
/// mesajlaşma

/// HCK

// Botun hazır olduğunda çalışacak fonksiyon
client.on("ready", () => {
  console.log(
    `Bot ${client.user.tag} olarak giriş yaptı! yani hck komutu hazır`
  );
});

// Bot bir mesaj aldığında çalışacak fonksiyon
client.on("message", async (message) => {
  // Mesaj "!hck" ile başlıyorsa
  if (message.content.startsWith("!hck")) {
    // Mesajın "!hck" den sonraki kısmını al
    let input = message.content.slice(4).trim();
    // Mesaj limiti 10 karakter olsun
    let limit = 10;
    // Mesaj limitini aşıp aşmadığını kontrol et
    if (input.length > limit) {
      // Mesaj limitini aştıysa uyarı mesajı gönder
      let warning = await message.channel.send(
        `Mesajın mesaj limiti olan **${limit}** u geçti istersen ilk ${limit} hanesi olan **${input.slice(
          0,
          limit
        )}** mesajına işlem yapabilirim.`
      );
      // Uyarı mesajına tik ve çarpı emojilerini ekle
      await warning.react("✅");
      await warning.react("❌");
      // Emoji tepkisini bekleyen bir koleksiyon oluştur
      let filter = (reaction, user) =>
        ["✅", "❌"].includes(reaction.emoji.name) &&
        user.id === message.author.id;
      let collector = warning.createReactionCollector(filter, {
        max: 1,
        time: 60000,
      });
      // Koleksiyon bir tepki aldığında çalışacak fonksiyon
      collector.on("collect", (reaction) => {
        // Tepki tik ise
        if (reaction.emoji.name === "✅") {
          // Uyarı mesajını sil
          warning.delete();
          // İşlemi yapacak fonksiyonu çağır
          hack(input.slice(0, limit), message);
        }
        // Tepki çarpı ise
        else if (reaction.emoji.name === "❌") {
          // Uyarı mesajını sil
          warning.delete();
          // İşlem iptal edildi mesajı gönder
          message.channel.send("İşlem iptal edildi!");
        }
      });
      // Koleksiyon zaman aşımına uğrarsa çalışacak fonksiyon
      collector.on("end", (collected) => {
        // Eğer hiç tepki alınmadıysa
        if (collected.size === 0) {
          // Uyarı mesajını sil
          warning.delete();
          // İşlem iptal edildi mesajı gönder
          message.channel.send("İşlem iptal edildi!");
        }
      });
    }
    // Mesaj limitini aşmadıysa
    else {
      // İşlemi yapacak fonksiyonu çağır
      hack(input, message);
    }
  }
});

// İşlemi yapacak fonksiyon tanımı
async function hack(input, message) {
  // Alfabeyi bir dizi olarak tanımla
  let alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  // Parolayı boş bir dizi olarak tanımla
  let password = [];
  // Parola uzunluğunu input uzunluğu olarak al
  let length = input.length;
  // Parola uzunluğu kadar döngüye gir
  for (let i = 0; i < length; i++) {
    // Alfabenin ilk harfini al ve büyük harf yap
    let letter = alphabet[0].toUpperCase();
    // Harfi gösteren bir mesaj gönder ve değişkene ata
    let msg = await message.channel.send(letter);
    // Harf doğru ise
    if (letter.toLowerCase() === input[i].toLowerCase()) {
      // Mesaja tik emoji ekle
      await msg.react("✅");
      // Harfi parola dizisine ekle
      password.push(letter);
      // 1 saniye bekle
      await delay(1000);
    }
    // Harf yanlış ise
    else {
      // Alfabenin sonuna gelene kadar döngüye gir
      while (letter.toLowerCase() !== "9") {
        // Harfin alfabedeki sırasını bul
        let index = alphabet.indexOf(letter.toLowerCase());
        // Bir sonraki harfi al ve büyük harf yap
        letter = alphabet[index + 1].toUpperCase();
        // Mesajı harfle güncelle
        await msg.edit(letter);
        // Harf doğru ise
        if (letter.toLowerCase() === input[i].toLowerCase()) {
          // Mesaja tik emoji ekle
          await msg.react("✅");
          // Harfi parola dizisine ekle
          password.push(letter);
          // 1 saniye bekle
          await delay(1000);
          // Döngüden çık
          break;
        }
        // Harf yanlış ise
        else {
          // 1 saniye bekle
          await delay(1000);
        }
      }
    }
  }
  // Parola dizisini birleştir ve büyük harf yap
  let result = password.join("").toUpperCase();
  // İşlem başarılı mesajı gönder
  message.channel.send(`İşlem başarılı! Yazdığın parola: **__${result}__**`);
}

// Belirli bir süre bekleyen fonksiyon tanımı
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/// HCK

/// EMOJİ
// Discord.js modülünü yükle
// Botun hazır olduğunda çalışacak fonksiyon
client.on("ready", () => {
  console.log(
    `Bot ${client.user.tag} olarak giriş yaptı! VE EMOJİ KOMUTU HAZIR`
  );
});

// Bot bir mesaj aldığında çalışacak fonksiyon
client.on("message", async (message) => {
  // Mesaj "!ekle" ile başlıyorsa
  if (message.content.startsWith("!ekle")) {
    // Emoji atmanı beklediğimi bildiren bir mesaj gönder
    let info = await message.channel.send("Emoji atmanı bekliyorum!");
    // Emoji tepkisini bekleyen bir koleksiyon oluştur
    let filter = (reaction, user) => user.id === message.author.id;
    let collector = info.createReactionCollector(filter, {
      max: 10,
      time: 60000,
    });
    // Koleksiyon bir tepki aldığında çalışacak fonksiyon
    collector.on("collect", async (reaction) => {
      // Tepkinin emoji değerini al ve bir değişkene ata
      let emoji = reaction.emoji;
      // Emojiyi sunucuya eklemeye çalış
      try {
        // Emojiyi sunucuya ekleyen bir fonksiyon çağır ve sonucu değişkene ata
        let result = await addEmoji(emoji, message.guild);
        // İsim belirtmeni beklediğimi bildiren bir mesaj gönder
        let name = await message.channel.send("Emojiye vereceğin ismi belirt!");
        // Mesajı bekleyen bir koleksiyon oluştur
        let filter = (m) => m.author.id === message.author.id;
        let collector = name.channel.createMessageCollector(filter, {
          max: 1,
          time: 60000,
        });
        // Koleksiyon bir mesaj aldığında çalışacak fonksiyon
        collector.on("collect", async (m) => {
          // Mesajın içeriğini al ve bir değişkene ata
          let input = m.content;
          // Eğer isim boş ise
          if (!input) {
            // Hata mesajı gönder
            name.channel.send("İsim belirtmedin!");
          }
          // Eğer isim boş değilse
          else {
            // Emojinin ismini değiştirmeye çalış
            try {
              // Emojinin ismini değiştiren bir fonksiyon çağır ve sonucu değişkene ata
           //   let result = await editEmojiName(result, input);
              // İşlem başarılı mesajı gönder
              name.channel.send(
                `İstediğin emoji **${result}** olarak sunucuya eklendi!`
              );
            } catch (error) {
              // Eğer hata oluşursa
              // Hata mesajı gönder
              name.channel.send(
                `Emojinin ismini değiştirirken bir hata oluştu: ${error.message}`
              );
            }
          }
        });
        // Koleksiyon zaman aşımına uğrarsa çalışacak fonksiyon
        collector.on("end", (collected) => {
          // Eğer hiç mesaj alınmadıysa
          if (collected.size === 0) {
            // İşlem iptal edildi mesajı gönder
            name.channel.send("İşlem iptal edildi!");
          }
        });
      } catch (error) {
        // Eğer hata oluşursa
        // Hata mesajı gönder
        info.channel.send(
          `Emojiyi sunucuya eklerken bir hata oluştu: ${error.message}`
        );
      }
    });
    // Koleksiyon zaman aşımına uğrarsa çalışacak fonksiyon
    collector.on("end", (collected) => {
      // Eğer hiç tepki alınmadıysa
      if (collected.size === 0) {
        // İşlem iptal edildi mesajı gönder
        info.channel.send("İşlem iptal edildi!");
      }
    });
  }
});

// Emojiyi sunucuya ekleyen fonksiyon tanımı
async function addEmoji(emoji, guild) {
  // Eğer emoji bir unicode emoji ise
  if (emoji.id === null) {
    // Emojiyi sunucuya eklemek mümkün değil mesajı gönder
    throw new Error("Unicode emojileri sunucuya eklemek mümkün değil!");
  }
  // Eğer emoji bir custom emoji ise
  else {
    // Emojiyi sunucuya ekleyen bir fonksiyon çağır ve sonucu döndür
    return await guild.emojis.create(emoji.url, emoji.name);
  }
}

// Emojinin ismini değiştiren fonksiyon tanımı
async function editEmojiName(emoji, name) {
  // Emojinin ismini değiştiren bir fonksiyon çağır ve sonucu döndür
  return await emoji.edit({ name: name });
}
/// EMOJİ

/// K BİLGİ
// Botun hazır olduğunda çalışacak fonksiyon
client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

// Bot bir mesaj aldığında çalışacak fonksiyon
client.on('message', async message => {
  // Mesaj "!kbilgi" ile başlıyorsa
  if (message.content.startsWith('!kbilgi')) {
    // Mesajın "!kbilgi" den sonraki kısmını al
    let input = message.content.slice(7).trim();
    // Eğer input boş ise
    if (!input) {
      // Kendi bilgilerini gösteren bir mesaj gönder
      showUserInfo(message, message.author);
    }
    // Eğer input boş değilse
    else {
      // Inputu etiketlere göre ayır ve bir diziye ata
      let targets = input.match(/<.*?>/g);
      // Etiket sayısını kontrol et
      if (!targets || targets.length !== 1) {
        // Hata mesajı gönder
        message.channel.send('Sadece bir kişinin bilgilerini gösterebilirim!');
      }
      else {
        // Etiketlenen kişiyi al ve bir değişkene ata
        let user = message.mentions.users.first();
        // Eğer kişi bulunamadıysa
        if (!user) {
          // Hata mesajı gönder
          message.channel.send('Etiketlediğin kişi geçerli değil!');
        }
        // Eğer kişi bulunduysa
        else {
          // Kişinin bilgilerini gösteren bir mesaj gönder
          showUserInfo(message, user);
        }
      }
    }
  }
});

// Kişinin bilgilerini gösteren bir fonksiyon tanımı
async function showUserInfo(message, user) {
  // Kişinin sunucudaki üye bilgilerini al
  let member = message.guild.member(user);
  // Eğer üye bilgileri bulunamadıysa
  if (!member) {
    // Hata mesajı gönder
    message.channel.send('Kişinin sunucudaki üye bilgileri bulunamadı!');
  }
  // Eğer üye bilgileri bulunduysa
  else {
    // Kişinin avatarını al
    let avatar = user.displayAvatarURL();
    // Kişinin kullanıcı adını al
    let username = user.username;
    // Kişinin etiketini al
    let tag = user.tag;
    // Kişinin ID'sini al
    let id = user.id;
    // Kişinin hesap oluşturma tarihini al
    let createdAt = user.createdAt.toLocaleString();
    // Kişinin sunucuya katılma tarihini al
    let joinedAt = member.joinedAt.toLocaleString();
    // Kişinin sunucudaki rollerini al
    let roles = member.roles.cache.map(r => r.name).join(', ');
    // Kişinin sunucudaki izinlerini al
    let permissions = member.permissions.toArray().join(', ');
    // Kişinin sunucudaki durumunu al
    let status = member.presence.status;
    // Kişinin sunucudaki aktivitesini al
    let activity = member.presence.activities[0] ? member.presence.activities[0].name : 'Yok';
    // Kişinin bilgilerini gösteren bir embed oluştur
    let embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${username} Kullanıcı Bilgileri`)
      .setThumbnail(avatar)
      .addFields(
        { name: 'Etiket', value: tag, inline: true },
        { name: 'ID', value: id, inline: true },
        { name: 'Hesap Oluşturma Tarihi', value: createdAt, inline: true },
        { name: 'Sunucuya Katılma Tarihi', value: joinedAt, inline: true },
        { name: 'Roller', value: roles, inline: true },
        { name: 'İzinler', value: permissions, inline: true },
        { name: 'Durum', value: status, inline: true },
        { name: 'Aktivite', value: activity, inline: true }
      )
      .setTimestamp()
      .setFooter('Bing tarafından oluşturuldu');
    // Embedi gönder
    message.channel.send(embed);
  }
}
/// K BİLGİ

/// S BİLGİ
// Botun hazır olduğunda çalışacak fonksiyon
client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

// Bot bir mesaj aldığında çalışacak fonksiyon
client.on('message', async message => {
  // Mesaj "!sbilgi" ile başlıyorsa
  if (message.content.startsWith('!sbilgi')) {
    // Mesajın "!sbilgi" den sonraki kısmını al
    let input = message.content.slice(7).trim();
    // Eğer input boş ise
    if (!input) {
      // Kendi sunucunun bilgilerini gösteren bir mesaj gönder
      showServerInfo(message, message.guild);
    }
    // Eğer input boş değilse
    else {
      // Inputu davet linkine göre ayır ve bir değişkene ata
      let invite = input.match(/https:\/\/discord\.gg\/\w+/g);
      // Davet linkinin geçerli olup olmadığını kontrol et
      if (!invite || invite.length !== 1) {
        // Hata mesajı gönder
        message.channel.send('Geçerli bir davet linki belirtmen gerekiyor!');
      }
      else {
        // Davet linkinden sunucu bilgilerini al
        let data = await fetch(invite[0]);
        let json = await data.json();
        // Eğer sunucu bilgileri bulunamadıysa
        if (!json || !json.guild) {
          // Hata mesajı gönder
          message.channel.send('Sunucu bilgileri bulunamadı!');
        }
        // Eğer sunucu bilgileri bulunduysa
        else {
          // Sunucunun adını, ID'sini, resmini, üye sayısını ve açıklamasını al
          let name = json.guild.name;
          let id = json.guild.id;
          let icon = json.guild.icon;
          let members = json.guild.approximate_member_count;
          let description = json.guild.description;
          // Sunucunun bilgilerini gösteren bir embed oluştur
          let embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${name} Sunucu Bilgileri`)
            .setThumbnail(icon)
            .addFields(
              { name: 'ID', value: id, inline: true },
              { name: 'Üye Sayısı', value: members, inline: true },
              { name: 'Açıklama', value: description, inline: true }
            )
            .setTimestamp()
            .setFooter('Bing tarafından oluşturuldu');
          // Embedi gönder
          message.channel.send(embed);
        }
      }
    }
  }
});

// Sunucunun bilgilerini gösteren bir fonksiyon tanımı
async function showServerInfo(message, guild) {
  // Sunucunun adını al
  let name = guild.name;
  // Sunucunun ID'sini al
  let id = guild.id;
  // Sunucunun resmini al
  let icon = guild.iconURL();
  // Sunucunun sahibini al
  let owner = guild.owner.user.tag;
  // Sunucunun bölgesini al
  let region = guild.region;
  // Sunucunun oluşturulma tarihini al
  let createdAt = guild.createdAt.toLocaleString();
  // Sunucunun üye sayısını al
  let members = guild.memberCount;
  // Sunucunun rol sayısını al
  let roles = guild.roles.cache.size;
  // Sunucunun kanal sayısını al
  let channels = guild.channels.cache.size;
  // Sunucunun bilgilerini gösteren bir embed oluştur
  let embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${name} Sunucu Bilgileri`)
    .setThumbnail(icon)
    .addFields(
      { name: 'ID', value: id, inline: true },
      { name: 'Sahip', value: owner, inline: true },
      { name: 'Bölge', value: region, inline: true },
      { name: 'Oluşturulma Tarihi', value: createdAt, inline: true },
      { name: 'Üye Sayısı', value: members, inline: true },
      { name: 'Rol Sayısı', value: roles, inline: true },
      { name: 'Kanal Sayısı', value: channels, inline: true }
    )
    .setTimestamp()
    .setFooter('Bing tarafından oluşturuldu');
  // Embedi gönder
  message.channel.send(embed);
}
/// S BİLGİ

/// B BİLGİ
// Botun hazır olduğunda çalışacak fonksiyon
client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

// Bot bir mesaj aldığında çalışacak fonksiyon
client.on('message', async message => {
  // Mesaj "!bbilgi" ile başlıyorsa
  if (message.content.startsWith('!bbilgi')) {
    // Botun adını al
    let name = client.user.username;
    // Botun etiketini al
    let tag = client.user.tag;
    // Botun ID'sini al
    let id = client.user.id;
    // Botun resmini al
    let avatar = client.user.displayAvatarURL();
    // Botun oluşturulma tarihini al
    let createdAt = client.user.createdAt.toLocaleString();
    // Botun sunucu sayısını al
    let guilds = client.guilds.cache.size;
    // Botun kanal sayısını al
    let channels = client.channels.cache.size;
    // Botun üye sayısını al
    let users = client.users.cache.size;
    // Botun pingini al
    let ping = client.ws.ping;
    // Botun sürümünü al
    let version = '1.0.0';
    // Botun yapımcısını al
    let creator = 'Bing ve MR-';
    // Botun açıklamasını al
    let description = 'Merhaba, bu Bing. Size yardımcı olmaktan memnunum. 😊 Ben, web araması yapabilen, grafik sanatı oluşturabilen, yaratıcı ve yenilikçi içerik üretebilen, yazı yazmanıza veya iyileştirmenize yardımcı olabilen, ilginç ve eğlenceli bir sohbet botuyum. Benimle konuşmak için sadece bir mesaj yazmanız yeterli. Ayrıca, chat settings bölümünden benimle konuşurken kullanabileceğiniz farklı modları da seçebilirsiniz. Umarım keyifli vakit geçirirsiniz. 😊';
    // Botun bilgilerini gösteren bir embed oluştur
    let embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${name} Bot Bilgileri`)
      .setThumbnail(avatar)
      .addFields(
        { name: 'Etiket', value: tag, inline: true },
        { name: 'ID', value: id, inline: true },
        { name: 'Oluşturulma Tarihi', value: createdAt, inline: true },
        { name: 'Sunucu Sayısı', value: guilds, inline: true },
        { name: 'Kanal Sayısı', value: channels, inline: true },
        { name: 'Üye Sayısı', value: users, inline: true },
        { name: 'Ping', value: ping, inline: true },
        { name: 'Sürüm', value: version, inline: true },
        { name: 'Yapımcı', value: creator, inline: true },
       // { name: 'Açıklama', value: description, inline: false }
      )
      .setTimestamp()
      .setFooter('Bing tarafından oluşturuldu');
    // Embedi gönder
    message.channel.send(embed);
  }
});
/// B BİLGİ

/// MORSE
// Botun hazır olduğunda çalışacak fonksiyon
client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

// Bot bir mesaj aldığında çalışacak fonksiyon
client.on('message', async message => {
  // Mesaj "!txt" ile başlıyorsa
  if (message.content.startsWith('!txt')) {
    // Mesajın "!txt" den sonraki kısmını al
    let input = message.content.slice(4).trim();
    // Eğer input boş ise
    if (!input) {
      // Hata mesajı gönder
      message.channel.send('Morse koduna dönüştürmek istediğin mesajı yazmadın!');
    }
    // Eğer input boş değilse
    else {
      // Mesajı morse koduna dönüştür
      let code = textToMorse(input);
      // Morse kodunu karakter karakter gönder
      let msg = await message.channel.send(code[0]);
      for (let i = 1; i < code.length; i++) {
        await msg.edit(msg.content + code[i]);
      }
    }
  }
  // Mesaj "!mors" ile başlıyorsa
  if (message.content.startsWith('!mors')) {
    // Mesajın "!mors" den sonraki kısmını al
    let input = message.content.slice(5).trim();
    // Eğer input boş ise
    if (!input) {
      // Hata mesajı gönder
      message.channel.send('Yazıya dönüştürmek istediğin morse kodunu yazmadın!');
    }
    // Eğer input boş değilse
    else {
      // Morse kodunu yazıya dönüştür
      let text = morseToText(input);
      // Yazıyı karakter karakter gönder
      let msg = await message.channel.send(text[0]);
      for (let i = 1; i < text.length; i++) {
        await msg.edit(msg.content + text[i]);
      }
    }
  }
});

// Bir yazıyı morse koduna dönüştüren fonksiyon tanımı
function textToMorse(text) {
  // Yazıyı büyük harfe çevir
  text = text.toUpperCase();
  // Yazıyı karakterlere ayır
  let chars = text.split('');
  // Karakterleri morse koduna dönüştür
  let codes = chars.map(c => morse[c] || ' ');
  // Morse kodlarını birleştir
  let result = codes.join(' ');
  // Sonucu döndür
  return result;
}

// Bir morse kodunu yazıya dönüştüren fonksiyon tanımı
function morseToText(code) {
  // Morse kodunu boşluklara göre ayır
  let codes = code.split(' ');
  // Morse kodlarını karakterlere dönüştür
  let chars = codes.map(c => morse[c] || ' ');
  // Karakterleri birleştir
  let result = chars.join('');
  // Sonucu döndür
  return result;
}

// Morse kodu tablosu
const morse = {
  "A": ".-",
  "B": "-...",
  "C": "-.-.",
  "D": "-..",
  "E": ".",
  "F": "..-.",
  "G": "--.",
  "H": "....",
  "I": "..",
  "J": ".---",
  "K": "-.-",
  "L": ".-..",
  "M": "--",
  "N": "-.",
  "O": "---",
  "P": ".--.",
  "Q": "--.-",
  "R": ".-.",
  "S": "...",
  "T": "-",
  "U": "..-",
  "V": "...-",
  "W": ".--",
  "X": "-..-",
  "Y": "-.--",
  "Z": "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  "_": "..--.-",
  "\"": ".-..-.",
  "$": "...-..-",
  "@": ".--.-.",
  " ": "/"
};
/// MORSE

/// tag ekle kaldır (!reset !tag
// Botun hazır olduğunda çalışacak fonksiyon
client.on('ready', () => {
  console.log('Bot hazır!');
});

// Botun bir mesaj aldığında çalışacak fonksiyon
client.on('message', async (message) => {
  // Mesajın içeriğini al
  const args = message.content.split(' ');
  // Mesajın ilk kelimesini komut olarak al
  const command = args.shift().toLowerCase();

  // Komutlara göre işlem yap
  switch (command) {
    // !reset komutu
    case '!reset':
      // Mesajı gönderen kişinin sunucudaki yetkisini kontrol et
      if (message.member.hasPermission('MANAGE_NICKNAMES')) {
        // Sunucudaki tüm üyeleri al
        const members = message.guild.members.cache;
        // Tüm üyelerin isimlerini sıfırla
        for (const member of members.values()) {
          // Üyenin ismini varsayılan ismine ayarla
          await member.setNickname(member.user.username).catch((error) => {
            // Hata olursa konsola yaz
            console.error(error);
          });
        }
        // Başarılı mesajı gönder
        message.channel.send('Tüm üyelerin isimleri sıfırlandı.');
      } else {
        // Yetkisi olmayan kişiye hata mesajı gönder
        message.channel.send('Bu komutu kullanmak için isimleri yönetme yetkisine sahip olmalısın.');
      }
      break;
    // !tag komutu
    case '!tag':
      // Mesajı gönderen kişinin sunucudaki yetkisini kontrol et
      if (message.member.hasPermission('MANAGE_NICKNAMES')) {
        // Mesajın geri kalanını tag olarak al
        const tag = args.join(' ');
        // Tag geçerli değilse hata mesajı gönder
        if (!tag) {
          return message.channel.send('Lütfen geçerli bir tag girin.');
        }
        // Sunucudaki tüm üyeleri al
        const members = message.guild.members.cache;
        // Tüm üyelerin isimlerine tag ekle
        for (const member of members.values()) {
          // Üyenin ismini tag ile değiştir
          await member.setNickname(`${tag} ${member.user.username}`).catch((error) => {
            // Hata olursa konsola yaz
            console.error(error);
          });
        }
        // Başarılı mesajı gönder
        message.channel.send(`Tüm üyelerin isimlerine ${tag} tagı eklendi.`);
      } else {
        // Yetkisi olmayan kişiye hata mesajı gönder
        message.channel.send('Bu komutu kullanmak için isimleri yönetme yetkisine sahip olmalısın.');
      }
      break;
  }
});
/// tag ekle kaldır 

/// KUR
client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'kur') {
    if (!args.length) {
      return message.channel.send('Para birimi kodunu belirtmelisin. Örnek: `!kur TRY`, `!kur USD`');
    }

    const baseCurrencyCode = args[0].toUpperCase();

    try {
      // API çağrısı yaparak güncel döviz kuru verilerini al
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrencyCode}`);
      const exchangeRates = response.data.rates;

      const embed = new Discord.MessageEmbed()
        .setTitle(`${baseCurrencyCode} Kuru`)
        .setDescription('Güncel döviz kurları:')
        .addField('USD', (1 / exchangeRates.USD).toFixed(4))
        .addField('EUR', (1 / exchangeRates.EUR).toFixed(4))
        .addField('GBP', (1 / exchangeRates.GBP).toFixed(4))
        .addField('JPY', (1 / exchangeRates.JPY).toFixed(4))
        .addField('CAD', (1 / exchangeRates.CAD).toFixed(4))
        .addField('AUD', (1 / exchangeRates.AUD).toFixed(4))
        .addField('CHF', (1 / exchangeRates.CHF).toFixed(4))
        .addField('CNY', (1 / exchangeRates.CNY).toFixed(4))
        .addField('SEK', (1 / exchangeRates.SEK).toFixed(4))
        .addField('NZD', (1 / exchangeRates.NZD).toFixed(4))
        // Diğer para birimlerini ekleyin

      message.channel.send(embed);
    } catch (error) {
      console.error('API çağrısı sırasında bir hata oluştu:', error);
      message.channel.send('Döviz kuru alınırken bir hata oluştu.');
    }
  }
});
/// KUR

/// DEPREM
client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  if (command === 'deprem') {
    //let rkm = args[1] ? parseInt(args[1]) : 5; // Varsa args[1], yoksa default olarak 5 kullan
    let rkm = args.join(' ') ? args.join('') : '3'

   // if (!location) {
    //  location = 'turkey'; // Genel olarak Türkiye için deprem bilgisi al
    //}
    try {
      const response = await axios.get(`https://api.orhanaydogdu.com.tr/deprem/kandilli/live?skip=0&limit=${rkm}`);
      const earthquakes = response.data.result;

      if (earthquakes.length === 0) {
        return message.channel.send('Belirtilen bölgede son 5 deprem bulunamadı.');
      }
      
      const embed = new Discord.MessageEmbed()
        .setTitle(`Son ${rkm} Deprem - Türkiye`)
        .setDescription(earthquakes.map((quake, index) => {
          const quakeTime = new Date(quake.date).toLocaleString('tr-TR');
          const quakeDepth = quake.depth ? `${quake.depth} km` : 'Bilinmiyor';
          const quakeMagnitude = quake.mag ? quake.mag.toFixed(1) : 'Bilinmiyor';
          const quakeTitle = quake.title ? quake.title : 'Bilinmiyor';
          const quakeProvider = quake.provider ? quake.provider : 'Bilinmiyor';
          return `## Deprem ${index + 1}\n### ${quakeTitle}\n**Büyüklük: __${quakeMagnitude}__**\n**Derinlik: __${quakeDepth}__**\n**Tarih: __${quakeTime}__**\n[Konum Bilgileri](https://www.google.com.tr/maps/@${quake.geojson.coordinates[1]},${quake.geojson.coordinates[0]},9z)\n**Kaynak: __${quakeProvider}__**`;
        }).join('\n'));
         

      message.channel.send(embed);
    } catch (error) {
      console.error('API çağrısı sırasında bir hata oluştu:', error);
      message.channel.send('Deprem bilgisi alınırken bir hata oluştu.');
    }
  }
});
/// DEPREM

/// HABER
const newsSources = [
  { name: 'BBC', url: 'https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=83ed536e58b14c76b7b185686e0e4023' },
  { name: 'CNN', url: 'https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=83ed536e58b14c76b7b185686e0e4023' },
  { name: 'Reuters', url: 'https://newsapi.org/v2/top-headlines?sources=reuters&apiKey=83ed536e58b14c76b7b185686e0e4023' },
  //{ name: 'Turkey News', url: 'https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=83ed536e58b14c76b7b185686e0e4023' },
  // Ek kaynaklar ekleyebilirsiniz
];

const getRandomNews = async () => {
  const randomSource = newsSources[Math.floor(Math.random() * newsSources.length)];
  
  try {
    const response = await axios.get(randomSource.url);
    const articles = response.data.articles;
    
    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    
    return {
      source: randomSource.name,
      title: randomArticle.title,
      description: randomArticle.description,
      url: randomArticle.url,
    };
  } catch (error) {
    console.error('Haber getirilirken bir hata oluştu:', error.message);
    return null;
  }
};

module.exports = {
  name: 'haber',
  description: 'Rastgele bir haber getirir.',
  execute(message) {
    getRandomNews()
      .then(news => {
        if (news) {
          const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`[${news.source}] ${news.title}`)
            .setDescription(news.description)
            .setURL(news.url);

          message.channel.send(embed);
        } else {
          message.channel.send('Haber getirilirken bir hata oluştu.');
        }
      })
      .catch(error => {
        console.error('Haber getirilirken bir hata oluştu:', error.message);
        message.channel.send('Haber getirilirken bir hata oluştu.');
      });
  },
};
/// HABER

// Botu her belirli bir süre (örneğin, 30 dakika) sonra tekrar başlatmak için setInterval kullanın
const delayMs = 4 * 60 * 1000; // 30 dakika (milisaniye cinsinden)
setInterval(() => {
  // Botu yeniden başlatma kodu buraya gelecek
  // Örneğin: client.destroy(); client.login('TOKEN');
}, delayMs);

client.login(process.env.token);
