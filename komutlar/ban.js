const Discord = require('discord.js');
const fs = require('fs');
const db = require('quick.db');

exports.run = (client, message, args) => {

if(db.fetch(`bakimmod`)) {

 if(message.author.id !== "683752128644251660") return message.channel.send('```Şuanlık Discord Botumuz Bakımdadır Lütfen Bir Kaç Saat Sonra Tekrar Deneyiniz Veya Bana Ulaşın```')

}
//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS

if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send(`Bu komutu kullanabilmek için "\`Yönetici\`" yetkisine sahip olmalısın.`);
if (!message.guild) {
 const ozelmesajuyari = new Discord.MessageEmbed()
 .setColor('GREEN')
 .setTimestamp()
 .setAuthor(message.author.username, message.author.avatarURL)
 .addField('Uyarı', '`ban` adlı komutu özel mesajlarda kullanamazsın.')
 return message.author.send(ozelmesajuyari); }
 let guild = message.guild
 let reason = args.slice(1).join(' ');
 let dızcılaraselam = message.mentions.users.first();//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS

 if (message.mentions.users.size < 1) return message.channel.send(`Lütfen sunucudan yasaklayacağınız kişiyi etiketleyin.`).catch(console.error);

 if (!message.guild.member(dızcılaraselam).bannable) return message.channel.send(`❌ Belirttiğiniz kişinin Yetkisi Benden Daha Üstün!`);
 message.guild.member(dızcılaraselam).ban();

 message.channel.send(" Başarılı, " + dızcılaraselam + " **İD'li kullanıcı** " + reason + " **sebebiyle sunucudan yasaklandı.**")
 
};

exports.conf = {
 enabled: true,
 guildOnly: true,
 aliases: ['ban'],
 permLevel: 0,
 kategori: "moderasyon",
};

exports.help = {
 name: 'ban',
 description: 'İstediğiniz kişiyi sunucudan yasaklar.',
 usage: 'ban <@kullanıcı> <sebep>',
 
};