const moment = require('moment')
require('moment-duration-format');
const os = require('os');
const Discord = require('discord.js')

let db = require("quick.db")//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS
let ayarlar = require("../ayarlar.json")


exports.run = (client, message, args) => {
    const dizi = []
        client.guilds.cache.find((item, i) => {
            dizi.push(item.memberCount)
        })
        var toplam = 0
        for (var i = 0; i < dizi.length; i++) {
            if (isNaN(dizi[i])) {
                continue;
            }

            toplam += Number(dizi[i])
        }
        const uptime = moment.duration(client.uptime).format("D [gün], H [saat], m [dakika], s [saniye]")

        const embed = new Discord.MessageEmbed()
.setColor('GREEN')
            .setTitle('yDarK | İstatistik')
            .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
            .setFooter("İstatistik", client.user.avatarURL())
            .addField("» **Botun Sahibi**", `<@${process.env.sahip}>`)
            .addField(" ** Gecikme süreleri**","Mesaj Gecikmesi: {ping1} ms \nBot Gecikmesi: {ping2} ms"
        .replace("{ping1}", new Date().getTime() - message.createdTimestamp)
        .replace("{ping2}", client.ws.ping),true)
            .addField(' Kullanıcı Sayısı', toplam, true)
            .addField(' Sunucu Sayısı', client.guilds.cache.size, true)
            .addField(' Kanal Sayısı', client.channels.cache.size, true)
            .addField(' Çalışma Süresi', uptime, true)
            .addField(' Node.JS Versiyon', process.version, true)
            .addField(' Ram Kullanımı', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0), true)
            .addField(' CPU', `\`\`\`${os.cpus().map(i => i.model)[0]}\`\`\``)
            .addField(' Bit', os.arch(), true)
            .addField(' İşletim Sistemi', os.platform(), true)

        message.channel.send(embed)//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS
};

exports.conf = {
    aliases: ["i"]
};

exports.help = {
    name: 'istatistik',
    description: 'İstatistik',
    usage: 'İstatistik'
};