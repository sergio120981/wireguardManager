const { exec } = require('child_process');
const fs = require('fs');
const moment = require('moment');

const getKeyAndPub = async () => {

    return new Promise((resolve, reject) => {
        let res;
        exec('umask 077; wg genkey | tee /tmp/key____wg | wg pubkey > /tmp/pub____wg ; cat /tmp/key____wg ; cat /tmp/pub____wg; rm /tmp/*____wg', (error, stdout, stderr) => {
        if (error) {
            reject(`error: ${error.message}`);
            return;
        }
    
        if (stderr) {
            reject(`stderr: ${stderr}`);
            return;
        }
        
        resolve(stdout.split('\n'));

        }); 
    });
}

const manageService = async (file, action) => {
    return new Promise ((resolve, reject)=> {
        exec(`wg-quick ${action} ${file}`, (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
                return;
            }
        
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            console.log(stdout.green);
            resolve(true);
        });
    });
}

const mvWgConfig = async (file) => {
    return new Promise((resolve, reject)=>{
        exec(`mv ${file} ${file}.bak.${moment().format('YYYY-MM-DD_HH-m-s')} && umask 077 && touch ${file}`, (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
                return;
            }
        
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            console.log(stdout.green);
            resolve(true);
        }); 
    })
}

const putNewWgConfig = async (interface, peers) => {
    try {
        let salida=`[Interface]
Address = ${interface[0].address}
ListenPort = ${interface[0].listenPort}
PrivateKey = ${interface[0].privateKey}

PostUp = ${interface[0].postUp}
PostDown = ${interface[0].postDown}
        `;
    peers.forEach(peer => {
        salida+=`
[Peer]
PublicKey = ${peer.publicKey}
AllowedIPs = ${peer.allowedIps}
`;
    });

    //console.log(interface[0].id);
    fs.writeFileSync(interface[0].id, salida);
    
    } catch (error) {
        console.log('Error escribiendo el .conf: '+error);
        //throw error;
        return false;
    }
    return true;
}

module.exports={getKeyAndPub, mvWgConfig, putNewWgConfig, manageService};