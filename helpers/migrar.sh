#!/bin/bash


listado=$(grep PublicKey wg0.conf | awk -F ' = ' {'print $2'})

for key in $listado; do
	usuario=$(grep -Rl "$key" pub/ | cut -d '/' -f 2 | cut -d '.' -f 1)
	privateKey=$(cat client_keys/$usuario)
	publicKey=$(cat pub/$usuario.pub)
	#echo KEY $key USUARIO $usuario '[Interface] PrivateKey' $ipk
	ip=$(grep Address client_confs/$usuario.conf | awk -F ' = ' {'print $2'} | cut -d '/' -f 1)
	allowedIps=$ip/32
	interfaceAddress=$ip/24
	#echo $usuario $privateKey $publicKey $allowedIps $interfaceAddress
# interface_id, usuario, publicKey, allowedIps, interfacePrivateKey, interfaceAdress
	sqlite3 ../../Dev/nodejsConsoleWireguardManager/database/wg2.sqlite3 "insert into wg_peer (interface_id, usuario, publicKey, allowedIps, interfacePrivateKey, interfaceAdress) values ('/home/sergio/Documentos/wireguard/wg1.conf', '$usuario', '$publicKey', '$allowedIps', '$privateKey', '$interfaceAddress')"
done

