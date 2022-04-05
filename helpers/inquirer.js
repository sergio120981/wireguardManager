const inquirer = require("inquirer");
const validator= require("validator");
let fs=require('fs');
const { red, green } = require("colors");
const { resolve } = require("path");
require("colors");

const inquirerMenu=async()=>{
    console.clear();
    console.log('========================='.green);
    console.log('  SELECCIONE UNA OPCION  '.yellow);
    console.log('========================='.green);

	const preguntas=[{
	    type: "list",
	    name: "opcion",
        pageSize: 20,
        loop: false,
	    message: "Que desea hacer?",
	    choices:[

            new inquirer.Separator(`${'1. '.green} ${'Gestionar fichero de configuracion.'.yellow}`),
            {
                value: 1.1,
                name: `${'1.1. '.green} Crear.`
            },
            {
                value: 1.2,
                name: `${'1.2. '.green} Modificar.`
            },
            {
                value: 1.3,
                name: `${'1.3. '.green} Eliminar.`
            },
            {
                value: 2,
                name: `${'2. '.green} Seleccionar fichero de configuracion.`
            },
            new inquirer.Separator(`${'3. '.green} ${'Configurar Peer.'.yellow}`),
            {
                value: 3.1,
                name: `${'3.1. '.green} Listado.`
            },
            {
                value: 3.2,
                name: `${'3.2. '.green} Nuevo.`
            },
            new inquirer.Separator(`${'4. '.green} ${'Generar ficheros.'.yellow}`),
            {
                value: 4.1,
                name: `${'4.1. '.green} Configuracion de Interface.`
            },
            {
                value: 4.2,
                name: `${'4.2. '.green} Configuracion de usuario.`
            },
            new inquirer.Separator(),
            {
                value: 0,
                name: '0. Salir'.red
            },
            new inquirer.Separator()
	    ]
	}];



    const {opcion}= await inquirer.prompt(preguntas);
    return opcion;
}


const pausa = async () => {

    const question = [
        {
            type: "input",
            name: 'enter',
            message: 'Presione '+'ENTER'.red+' para continuar'
        }
    ];

    const {enter}=await inquirer.prompt(question);
    return enter;
};

const listarFicherosWG= async( arrayFiles ) => {
    console.clear();

    let choices=[];
    JSON.parse(arrayFiles).forEach(element => {
        choices.push({value: element, name: element});
    });
    
	const preguntas=[{
	    type: "list",
	    name: "opcion",
	    message: "Selecciones el fichero de configuracion?",
	    choices}];

    const {opcion}= await inquirer.prompt(preguntas);
    return opcion;    
}


const listFiles= async( arrayFiles ) => {
    //console.clear();

    let choices=[];
    
    arrayFiles.forEach(row=>{
        choices.push({value: row.id, name: row.id});
    })

    choices.push({value: 0, name: red('Cancelar')});

	const preguntas=[{
	    type: "list",
	    name: "opcion",
	    message: "Seleccione el fichero de configuracion: ".green,
	    choices}];
    console.log('');
    const {opcion}= await inquirer.prompt(preguntas);
    console.log('');
    return opcion;    
}

    const createConfigFile = async ()=> {
        const question = [
            {
                type: "input",
                name: 'id',
                message: 'Ruta del fichero de configuracion: ',
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    //agregar mas condiciones a la creacion del fichero en el fs
                    return true;
                }
            },
            {
                type: "input",
                name: 'address',
                message: 'Address: ',
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    if(!validator.isIPRange(value)){
                        return 'Ingrese un rango IP correcto formato IP/(mask 32bits)';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'listenPort',
                message: 'ListenPort (51820 default): ',
                default: 51820
            },
            {
                type: "input",
                name: 'privateKey',
                message: 'PrivateKey: '
            },
            {
                type: "input",
                name: 'postUp',
                message: 'PostUp: '
            },
            {
                type: "input",
                name: 'postDown',
                message: 'PostDown: '
            }
        ];
        const resp=await inquirer.prompt(question);
        return resp;
    };

    const showInterfaceInfo = async (info) => {
        const question = [
            {
                type: "input",
                name: 'address',
                message: 'Address: ',
                default: info.address,
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    if(!validator.isIPRange(value)){
                        return 'Ingrese un rango IP correcto formato IP/(mask 32bits)';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'listenPort',
                message: 'ListenPort: ',
                default: info.listenPort
            },
            {
                type: "input",
                name: 'privateKey',
                message: 'privateKey: ',
                default: info.privateKey
            },
            {
                type: "input",
                name: 'postUp',
                message: 'PostUp: ',
                default: info.postUp
            },
            {
                type: "input",
                name: 'postDown',
                message: 'PostDown: ',
                default: info.postDown
            }
        ];
        console.log('');
        console.log('...Correccion de la configuracion del fichero...'.green);
        console.log(green(info.id));
        console.log('');
        const resp = await inquirer.prompt ( question );
        resp['id']=info.id;
        return resp;
    }

    const getConfirmationDeleteFile = async( file ) => {
        const question = [
            {
                type: "confirm",
                name: 'confirm',
                message: 'Seguro que desea eliminar el registro correspondiente a: '.green+file,
            }];
        console.log('');
        const resp = await inquirer.prompt ( question );
        return resp;
    }

    const seleccionarUserIp= async () => {
        const question = [
            {
                type: "checkbox",
                name: 'seleccion',
                message: 'Ordenar por: '.green,
                choices: [
                    new inquirer.Separator(),
                    {
                      name: 'Usuario',
                      value: 'usuario'
                    },
                    {
                      name: 'Direccion IP',
                      value: 'allowedIps'
                    }],
                
                validate(answer) {
                    if (answer.length != 1 ) {
                        return 'Debe seleccionar solo uno...'.red;
                    }
            
                    return true;
                }
            }];
        console.log('');
        const resp = await inquirer.prompt ( question );
        return resp;
    }

    const printUsers = async (users, maxSize) => {
        console.log('');      
        /* const userHeader='Usuarios';
        const eS=' '.repeat(maxSize-userHeader.length+2);
        const header=`${userHeader}${eS} | AllowedIps`;
 */
        let choices=[];
//        choices.push({value: header});

        users.forEach(user => {
            const vacio=' '.repeat(maxSize-user.size+2);
            choices.push({name:`${user.usuario}${vacio} | ${user.allowedIps}`, value:user.id});
        });

        const listado=[{
            type: "list",
            name: "opcion",
            pageSize: 10,
            loop: true,
            message: "Listado de usuarios".green,
            choices}];
        
        const {opcion}= await inquirer.prompt(listado);
        return opcion;
    }

    const showOpciones = async (usuario) => {
        console.log('');
        const listado=[{
            type: "list",
            name: "opcion",
            message: `Acciones a realizar con el usuario: ${usuario}`.green,
            choices:[
                new inquirer.Separator(),
                {name: 'Ver detalles', value: 3},
                new inquirer.Separator(),
                {name: 'Actualizar', value: 1},
                {name: 'Eliminar', value: 2},
                new inquirer.Separator(),
                {name: 'Cancelar'.red, value: 0}
            ]
        }];
        const {opcion}= await inquirer.prompt(listado);
        return opcion;
    }

    const confirmarBorrado = async () => {
        console.log('');
        const questions = [
            {
              type: 'confirm',
              name: 'opcion',
              message: 'Esta seguro que desea eliminar el usuario?',
              default: true
            }
        ];
          
        const {opcion}= await inquirer.prompt(questions);
        return opcion;
    }

    const showPeerInfo = async (info, keyPub) => {

        showKeys(keyPub)
        
        questions=getQuestions(info);


        const opcion= await inquirer.prompt(questions);
        return opcion;
    }


    const showKeys = (keyPub) => {
        console.log('');
        console.log('New keys are recommended:');
        console.log(`Private Key: ${keyPub[0]}`);
        console.log(`Public Key: ${keyPub[1]}`);
        console.log('');
    }

    getQuestions=(defaultOptions=null)=>
     [
            {
                type: "input",
                name: 'publicKey',
                message: 'PublicKey: ',
                default: defaultOptions.publicKey || '',
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'allowedIps',
                message: 'AllowedIps: ',
                default: defaultOptions.allowedIps || '1.0.0.1/32',
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    if(!validator.isIPRange(value)){
                        return 'Ingrese un rango IP correcto formato IP/(mask 32bits)';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'interfacePrivateKey',
                message: 'Interface PrivateKey: ',
                default: defaultOptions.interfacePrivateKey || '',
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'interfaceAdress',
                message: 'Interface Address: ',
                default: defaultOptions.interfaceAdress || '1.0.0.0/24',
                validate(value){
                    if(value.length===0){
                        return 'Ingrese un valor';
                    }
                    if(!validator.isIPRange(value)){
                        return 'Ingrese un rango IP correcto formato IP/(mask 32bits)';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'interfaceDns',
                message: 'Interface DNS: ',
                default: defaultOptions.interfaceDns || '8.8.8.8',
                validate(value){
                    if(!validator.isIP(value)){
                        return 'Ingrese un rango IP correcto formato IP';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'peerPublicKey',
                message: 'Peer PublicKey: ',
                default: defaultOptions.peerPublicKey || 'xEstaAIivnyt77KTvWiO2mAXdoupFfGYg1r97oEDxyg=',
                validate(value){
                    if(value.length==0){
                        return 'Ingrese una cadena de caracteres';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'peerEndPoint',
                message: 'Peer EndPoint:',
                default: defaultOptions.peerEndPoint || '45.33.36.153:51820',
                validate(value){
                    if(!validator.isURL(value, 
                        [{ 
                            protocols: ['http','https'], require_tld: false, require_protocol: false, 
                            require_host: true, require_port: true, require_valid_protocol: false, 
                            allow_underscores: false, host_whitelist: false, host_blacklist: false, 
                            allow_trailing_dot: false, allow_protocol_relative_urls: false, 
                            allow_fragments: false, allow_query_components: false, disallow_auth: false, 
                            validate_length: false }]))
                        return 'Ingrese un rango IP correcto formato IP:Puerto(1-65.535)';
                    return true;
                }
            },
            {
                type: "input",
                name: 'peerAllowedIps',
                message: 'Peer AllowedIps: ',
                default: defaultOptions.peerAllowedIps || '0.0.0.0/0',
                validate(value){
                    if(!validator.isIPRange(value)){
                        return 'Ingrese un rango IP correcto formato IP/(mask 32bits)';
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: 'peerPersistentKeepAlive',
                message: 'Peer PersistentKeepAlive: ',
                default: defaultOptions.peerPersistentKeepAlive || '25',
                validate(value){
                    if(!validator.isInt(value))
                        return 'Ingrese un numero entero';
                    return true;
                }
            }
        ];

    const showNewPeer = async (keys) => {

        showKeys(keys);
        
        const questions = getQuestions({});

        questions.unshift({
            type: "input",
            name: 'usuario',
            message: 'Usuario: ',
            default: '',
            validate(value){
                if(!validator.isAlphanumeric(value))
                    return 'Ingrese un username valido con caracteres [a-zA-Z0-9]';
                return true;
            }
        });
        
        //console.log(questions);

        const opcion= await inquirer.prompt(questions);
        return opcion;
    }

    const showUserList = async (data) => {

        let choices=[];

        data.forEach(user => {
            choices.push({name:user.usuario, value:user.id});
        });

        console.log('');

        const questions = [
            {
                type: "checkbox",
                name: 'usersSelected',
                message: 'Listado de usuarios: '.green,
                choices}];

        const opcion= await inquirer.prompt(questions);
        return opcion;
    }

module.exports={
	inquirerMenu,
	pausa,
    listarFicherosWG,
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
    showUserList
};
