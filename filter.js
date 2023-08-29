const fs = require('fs');
const { Parser } = require('json2csv');

let jsonString = fs.readFileSync('lwart-7d289-default-rtdb-export.json', 'utf-8');
let jsonObj = JSON.parse(jsonString);

// Função de auxílio para converter milissegundos em minutos e segundos
function msToMinSecMs(ms) {
  let minutes = Math.floor(ms / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  let milliseconds = ((ms % 1000) / 1000).toFixed(3);
  return minutes + "m:" + (seconds < 10 ? '0' : '') + seconds + "s:" + milliseconds + "ms";
}

// Filtrar os usuários que tenham stepStop igual a 7
jsonObj = Object.keys(jsonObj).reduce((acc, user) => {
  if (jsonObj[user].stepStop.stepStop === 7) {
    acc[user] = jsonObj[user];
  }
  return acc;
}, {});

for (let user in jsonObj) {
  delete jsonObj[user].stepStop;
  delete jsonObj[user].userStepScore;
  delete jsonObj[user].userStepTime;
}

// Converta o objeto em um array e inclua o ID do usuário
let usersArray = Object.keys(jsonObj).map(id => {
    let userTotalTime = jsonObj[id].userTotalTime.userTotalTime;
    return {
        id,
        ...jsonObj[id],
        userTotalTime: userTotalTime,
        userTotalTimeFormatted: msToMinSecMs(userTotalTime)
    };
});

usersArray.sort((a, b) => b.userTotalScore.userTotalScore - a.userTotalScore.userTotalScore ||  a.userTotalTime - b.userTotalTime);

let top140 = usersArray.slice(0, 180);

// Converta os dados para o formato JSON
let json = JSON.stringify(top140, null, 2);

// json2csv Parser
const json2csvParser = new Parser();

// Converter para CSV
let csv = json2csvParser.parse(top140);

// Escreva os dados em um arquivo JSON
fs.writeFile('top140.json', json, (err) => {
  if (err) throw err;
  console.log('Arquivo JSON salvo com sucesso!');
});

// Escreva os dados em um arquivo CSV
fs.writeFile('top140.csv', csv, (err) => {
  if (err) throw err;
  console.log('Arquivo CSV salvo com sucesso!');
});
