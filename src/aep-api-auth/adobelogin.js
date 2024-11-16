/*Se importa el módulo que permite cargar las variables de ambiente*/
const dotenv = require('dotenv')
/*Se importa el módulo que permite generar JSON Web Token*/
const jwt = require('jsonwebtoken')
/*Se importa el módulo que permite convertir un objeto de Javascript a un string URL-Encoded*/
const querystring = require('querystring');
/*Se importa el módulo que permite realizar peticiones HTTP*/
const axios = require('axios')

/*Se establece la configuración del archivo que contiene las variables de ambiente*/
dotenv.config({path: ['config/aep.env']})

/*Se define una función de generación de JSON Web Token*/
function generate_json_web_token(){

    /*Se define una variable que contiene el JSON Web Token generado*/
    let json_web_token

    try{

    /*Se define una variable que contiene el payload para la generación del JSON Web Token*/
    const payload = {
        exp: Math.round(87000 + Date.now() / 1000),
        iss: process.env.IMS_ORG,
        sub: process.env.TECHNICAL_ACCOUNT_ID,
        aud: "https://ims-na1.adobelogin.com/c/" + process.env.API_KEY
    }

    /*Se define una variable que contiene los metascopes asociados al método de autenticación*/
    const metascopes = process.env.METASCOPES.split(",")
    
    /*Se hace una iteración sobre todos los elementos de la variable que
    contiene los metascopes asociados al método de autenticación*/
    for (const metascope of metascopes) {
        
        /*Se define una variable que contiene el metascope asociado a su URL en Adobe Login*/
        const scope = "https://ims-na1.adobelogin.com/s/" + metascope
        
        /*Se establece el acceso relacionado al metascope y URL en Adobe Login*/
        payload[scope] = true
    
    }
    
    /*Se define una variable que contiene el JSON Web Token, generado a partir del payload definido
    anteriormente, en conjunto con la llave privada y la definición del algoritmo a utilizar*/
    json_web_token = jwt.sign(payload, process.env.PRIVATE_KEY, {
        algorithm: "RS256",
        header: {
            algorithm: "RS256"
        }
    })

    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.error(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    }finally{

        /*Se retorna el JSON Web Token a la función original*/
        return json_web_token

    }

}

/*Se define una función de generación de token de acceso usando el estandar de JSON Web Token*/
async function generate_access_token_using_jwt(json_web_token){

    /*Se define una variable que contiene la respuesta la respuesta de la petición HTTP*/
    let response

    /*Se despliega un fragmento de código con un try...catch*/
    try{

        /*Se define una variable que contiene el cuerpo vacío requerido para la generación del token de acceso*/
        const body = {
            "client_id": process.env.API_KEY,
            "client_secret": process.env.CLIENT_SECRET,
            "jwt_token": json_web_token
        }

        /*Se establece la variable que contiene la respuesta de la petición que se obtiene a partir
        del envío de la petición POST usando axios, con el cuerpo de petición definido anteriormente*/
        response = await axios.post("https://ims-na1.adobelogin.com/ims/exchange/jwt/", querystring.stringify(body))

        /*Se retorna la respuesta de la petición a la función original*/
        return response
    
    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se establece la respuesta de la petición en base al error obtenido*/
        response = error.response

        /*Se muestra en consola el error obtenido*/
        console.error(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    
    }finally{

        /*Se retorna la respuesta de la petición a la función original*/
        return response
        
    }
}

/*Se define una función de generación de token de acceso usando el estandar de JSON Web Token*/
async function generate_access_token_using_oauth(){

    /*Se define una variable que contiene la respuesta la respuesta de la petición HTTP*/
    let response

    /*Se despliega un fragmento de código con un try...catch*/
    try{

        /*Se define una variable que contiene los parámetros requeridos para la generación del token de acceso*/
        const params = {
            "grant_type": process.env.GRANT_TYPE,
            "client_id": process.env.API_KEY,
            "client_secret": process.env.CLIENT_SECRET,
            "scope": process.env.SCOPES
        }

        /*Se define una variable que contiene el cuerpo vacío requerido para la generación del token de acceso*/
        const body = {
            
        }

        /*Se establece la variable que contiene la respuesta de la petición que se obtiene a partir del envío
        de la petición POST usando axios, con los parámetros y cuerpo de petición definidos anteriormente*/
        response = await axios.post("https://ims-na1.adobelogin.com/ims/token/v2", body, {
            params: params
        })
    
    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se establece la respuesta de la petición en base al error obtenido*/
        response = error.response

        /*Se muestra en consola el error obtenido*/
        console.error(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    }finally{

        /*Se retorna la respuesta de la petición a la función original*/
        return response

    }
}

/*Se definen las funciones a exportar*/
module.exports = {
    generate_json_web_token: generate_json_web_token,
    generate_access_token_using_jwt: generate_access_token_using_jwt,
    generate_access_token_using_oauth: generate_access_token_using_oauth
}