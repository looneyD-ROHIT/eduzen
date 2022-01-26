console.log('Test File!');
const footerDTime = document.getElementsByClassName('footerDTime');

const url = "https://api.ipify.org/?format=json"
let urlDTime = 'http://worldtimeapi.org/api/ip/';
let clientIp = "42.105.2.229";

fetch(url)
    .then(response => response.json())
    .then(data => {
        clientIp = data['ip'];
        console.log(clientIp);
        urlDTime = urlDTime + `${clientIp}.json`;
        console.log(urlDTime);
        return fetch(urlDTime).then(response => response.json())})
    .then(d => {
        footerDTime[0].innerHTML = ` ${d['datetime'].slice(0,4)} `;
        console.log(d['datetime'].slice(0,4))
    });
