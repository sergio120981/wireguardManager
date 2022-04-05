#!/usr/bin/node

/*
if(process.env.USER!="root"){
	console.log("Se debe ejecutar como root o sudo");
	return;
}

*/
require("colors");
require('dotenv').config();

const BD = require("./db/db");
const {getKeyAndPub, mvWgConfig, putNewWgConfig, manageService} = require('./helpers/wireguard');
const { inquirerMenu, 
		pausa, 
		listFiles, 
		createConfigFile, 
		showInterfaceInfo, 
		getConfirmationDeleteFile, 
		seleccionarUserIp,
		printUsers,
		showOpciones,
		confirmarBorrado, 
		showPeerInfo,
		showNewPeer,
		showUserList } = require("./helpers/inquirer");

const {
	printUserInfo,
	printUsersConfigFiles} = require('./helpers/print');


const main = async () => {

	let opt=0;
	let confFile='';

	let db;

	do{
	
		opt = await inquirerMenu();
		
		

		switch (opt){
			case 1: break;

			case 1.1:

				let resp = await createConfigFile();
				try{
					
					db=new BD;
					let q = await db.saveInterface(resp);
					db.close();

					if(q)console.log('Completado con exito.'.green);
					else console.log('Algo raro paso'.red);
				}
				catch(err){
					console.log('Errores detectados en la insercion.'.red);
				}

				break;


			case 1.2:
				db=new BD;
				const resp12=await db.getConfigFiles();
				

				const opt = await listFiles(resp12);
				console.log('');
				let r;
				if(opt){
					try{
						r = await db.getFileInfo(opt);
						if(r.length==1){
							const nR = await showInterfaceInfo(r[0]);
							
							if(await db.saveInterfaceData(nR))
								console.log('Actualizado satisfactoriamente.'.green);
							else
								console.log('No se actualizo correctamente.');

						}
						else
							console.log('No se cuenta 1 registro en la captura de informacion, opt 1.2.'.red);
					}
					catch(err){
						//throw err;
						throw('Errores detectados en la busqueda de FILE.'.red);
					}
					
					//console.log(r);
				}
				db.close();
				break;


			case 1.3:

				db=new BD;
				const resp13=await db.getConfigFiles();

				const opt3 = await listFiles(resp13);
				if(opt3){
					
					if(await getConfirmationDeleteFile(opt3))
						try {
							if(await db.deleteFile(opt3))
								{
									confFile=undefined;
									console.log('');
									console.log(`Se ha eliminado con exito: ${opt3}`.green);
								}
							else
							{
								console.log('');
								console.log(`Ha ocurrido algun error eliminando el registro: ${opt3}`.red);
							}
								
						} catch (error) {
							console.log('');
							console.log(`No se pudo eliminar el registro: ${opt3}`.red);
						}

					}
					else
						console.log('No se selecciono fichero a borrar'.red);

					db.close();
				
				break;
				
			case 2:

				db=new BD;
				const resp2=await db.getConfigFiles();

				confFile = await listFiles(resp2);

				if(confFile===0)console.log('No se ha escogido fichero de configuracion');
				
				db.close();

				break;


			case 3.1:

				if(confFile) {
					
					let {seleccion}=await seleccionarUserIp();

					db=new BD();
					
					let resp31, maxUserSize;
					try {
						resp31=await db.getPeerList(confFile, seleccion[0]);
						maxUserSize= await db.getUserMaxSize(confFile);
					} catch (error) {
						console.log('');
						console.log ('Error en el listado de usuarios'.red+error);
					}

					if(resp31===[] || maxUserSize[0].size==0){
							console.log('');
							console.log ('Listado vacio para este fichero: '.red+confFile);
							console.log('');
							break;
					}
					else{
						let user, opcion;
						try {
							user = await printUsers(resp31, maxUserSize[0].size);
							opcion= await showOpciones(user);
							
						} catch (error) {
							console.log('Error seleccionando usuario Peer'.red);
						}
						
						switch (opcion){
							case 0: break;
							case 2:
								if(await confirmarBorrado()){
									//borrado
									try {
										if(await db.deletePeer(user))
											console.log('\r\nUsuario eliminado con exito'.green);
									} catch (error) {
										console.log(`No se pudo eliminar el registro Peer.`.red);
									}
								}
								break;
							case 1:
								try {
									const userData=await db.getPeerData4Update(user);

									const k = await getKeyAndPub();

									const userDataChanged = await showPeerInfo(userData[0], k);

									if(await db.updatePeerById(userDataChanged, user)){
										console.log('El usuario se ha actualizado correctamente'.green);
									}
									else
										console.log('El usuario no se pudo actualizar'.red);
								} catch (error) {
									console.log(`No se pudo actualizar el registro Peer.`.red);
								}
								break;
							
							case 3:
								try {
									const info= await db.getPeerById(user);
									printUserInfo(info);
									
								} catch (error) {
									console.log('No se pudo obtener la informacion del usuario. '.red +user);
								}
								
								break;
						}
					}

					db.close();

				}
				else
					console.log(`No se ha seleccionado ningun fichero para trabajarlo.`.red);

				break;

			case 3.2:
				
				if(confFile) {
					
					
					
					const k = await getKeyAndPub();
					const newPeer= await showNewPeer(k);

					newPeer.interface_id=confFile;

					try {
						db=new BD();
						if(await db.insertPeer(newPeer)){
							console.log('Registro insertado con exito en Peer'.green);
							db.close();
						}
						else	
							console.log('Error al insertar Peer'.red);
					} catch (error) {
						console.error('No se pudo insertar el nuevo registro Peer');
					}
				
				}
				else
					console.log(`No se ha seleccionado ningun fichero para trabajarlo.`.red);

				break;

			case 4.1:
				if(confFile) {
					const db=new BD();
					const interface= await db.getFileInfo(confFile);
					const peers=await db.getPeerByInterfaceId(confFile);
					db.close();

					if(process.env.USER=="root")await manageService(confFile, 'down');

					if(await mvWgConfig(confFile)){
						console.log('');
						console.log('Fichero de configuracion salvado con exito'.green);
						if( await putNewWgConfig(interface, peers)){
							console.log('');
							console.log('Generado satisfactoriamente el nuevo fichero de configuracion'.green);
							if(process.env.USER=="root")await manageService(confFile, 'up');
						}
						else{
							console.log('No se pudo generar el fichero de configuracion');
						}
					}
					else
						console.log('No se pudo salvar el fichero de configuracion: '.green+confFile);

					
				}
				else
					console.log(`No se ha seleccionado ningun fichero para trabajarlo.`.red);
				break;

			case 4.2:
					if(confFile) {
						db=new BD();
						try {
							const userList= await db.getPeerUsersByInterfaceId(confFile);
							const userListSelected = await showUserList(userList);
							
							if(userListSelected.usersSelected.length!==0){
								const usersConfigFiles= await db.getPeerConfigFiles(userListSelected.usersSelected);
								printUsersConfigFiles(usersConfigFiles);
							}
							else
							{
								console.log('');
								console.log('No se seleccionaron usuarios'.red);
							}

						} catch (error) {
							throw('No se pudo obtener el listado Peer '+error);
						}
						db.close();
						
					}
					else
						console.log(`No se ha seleccionado ningun fichero para trabajarlo.`.red);
				break;
			
		}

		if(opt)await pausa();

	}while(opt);
	console.log("");

};


main();
