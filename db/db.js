
const sqlite3 = require('sqlite3').verbose();

class BD{
    
    constructor(){
        this._db = new sqlite3.Database(process.env.WG_DB, sqlite3.OPEN_READWRITE,(err) => {
            if (err) throw ('Error de conexion a la BD: '+err.message); });
        try {
            if(!this._run('PRAGMA foreign_keys = ON'))
                console.log('Incorrecta actualizacion'.red);
        } catch (error) {
            console.log('Problema con PRAGMA !!!'.white.bgBlack);
        }
    }
    
    close(){
        return this._db.close();
    };

    _query(sql, params){
        return new Promise((resolve, reject) => {
            this._db.all(sql, params==undefined ? [] : params, (err, rows) => {
              if (err) {
                console.log('Error running sql: ' + sql);
                console.log(err);
                reject(err);
              } else {
                resolve(rows);
              }
            })
        });
    }

    _run(query) {
        return new Promise((resolve, reject) => {
            this._db.run(query, (err) => {
                    if(err) reject(err.message)
                    else    resolve(true)
            })
        })    
    }

    getConfigFiles(){
        return this._query('select id from wg_interface', []);
    }

    saveInterface(data){
        const values=`'${data.id}','${data.address}',${data.listenPort},'${(data.privateKey)?data.privateKey:''}','${(data.postUp)?data.postUp:''}','${(data.postDown)?data.postDown:''}'`;
        const sql= 'insert into wg_interface values ('+values+')';
        //return(sql);
        return this._run(sql);
    }

    getFileInfo(f){
        return this._query('select * from wg_interface where id=?', [f]);
    }

    saveInterfaceData(newRecord){
        const sql=`
        update wg_interface
            set address='${newRecord.address?newRecord.address:''}',
            listenPort=${newRecord.listenPort?newRecord.listenPort:51820},
            privateKey='${newRecord.privateKey?newRecord.privateKey:''}', 
            postUp='${newRecord.postUp?newRecord.postUp:''}',
            postDown='${newRecord.postDown?newRecord.postDown:''}' 
        where id='${newRecord.id}'
        `;
        return this._run(sql, []);
    }

    deleteFile(file){
        const sql=`delete from wg_interface where id='${file}'`;
        return this._query(sql, []);
    }

    getPeerList(interface_id, orderByParam){
        const sql=`select id, usuario,length(usuario) as size, case when allowedIps is null then 'SIN ASIGNAR' else allowedIps end as allowedIps from wg_peer where interface_id=? order by ${orderByParam}`;
        //console.log(sql);
        return this._query(sql, [interface_id]);
    }

    getUserMaxSize(interface_id){
        const sql='select case when max(length(usuario))>0 then max(length(usuario)) else 0 end as size from wg_peer where interface_id=?';
        //console.log(sql);
        return this._query(sql, [interface_id]);
    }

    deletePeer(peer_id){
        const sql='delete from wg_peer where id=?';
        return this._query(sql, [peer_id]);
    }

    getPeerData4Update(user){
        const sql='select * from wg_peer where id=?';
        return this._query(sql, [user]);
    }

    updatePeerById(data, userId){
        const sql=`
        update wg_peer 
        set 
            publicKey='${data.publicKey}',
            allowedIps='${data.allowedIps}',
            interfacePrivateKey='${data.interfacePrivateKey}',
            interfaceAdress='${data.interfaceAdress}',
            interfaceDns='${data.interfaceDns}',
            peerEndPoint='${data.peerEndPoint}',
            peerPublicKey='${data.peerPublicKey}',
            peerAllowedIps='${data.peerAllowedIps}',
            peerPersistentKeepAlive='${data.peerPersistentKeepAlive}'
        where id=${userId}`;
        return this._query(sql, [data]);
    }

    insertPeer(data){
        const sql=`
        insert into wg_peer 
        (
            usuario, publicKey, allowedIps, interfacePrivateKey, 
            interfaceAdress, interfaceDns, peerPublicKey, peerEndPoint, 
            peerAllowedIps, peerPersistentKeepAlive, interface_id) 
        values (?,?,?,?,?,?,?,?,?,?, ?)`; 

        return this._query(sql, 
            [data.usuario, data.publicKey, data.allowedIps, data.interfacePrivateKey, data.interfaceAdress,
                data.interfaceDns, data.peerPublicKey, data.peerEndPoint, data.peerAllowedIps,
                data.peerPersistentKeepAlive, data.interface_id]);
    }

    getPeerById(id){
        const sql=`select * from wg_peer where id = ?`; 

        return this._query(sql, [id]);
    }

    getPeerUsersByInterfaceId(id){
        const sql=`select id, usuario from wg_peer where interface_id = ? order by usuario`; 

        return this._query(sql, [id]);
    }

    getPeerConfigFiles(ids){
        const sql=`select * from wg_peer where id in (${ids.join(',')})`; 
        
        return this._query(sql, []);
    }

    getPeerByInterfaceId(interface_id){
        const sql='select * from wg_peer where interface_id=? order by allowedIps'; 
        
        return this._query(sql, [interface_id]);
    }
}

module.exports = BD;