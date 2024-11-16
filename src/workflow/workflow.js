/*Se importa el módulo que permite manipular archivos en formato CSV*/
const dataforge = require('data-forge')
/*Se importa el módulo que permite cargar archivos en formato CSV*/
require('data-forge-fs')
/*Se importa el módulo que permite trabajar con DataFrame*/
const dataframe = require('../../utils/dataframe.js')
/*Se importa el módulo que permite generar tokens de acceso para Experience Platform API*/
const access_token_generator = require('../aep-api-auth/adobelogin.js')
/*Se importa el módulo que permite realizar ingesta de registros mediante HTTP API*/
const streaming_ingestion = require('../aep-api/streaming_ingestion.js')

/*Se define una función para crear un nuevo flujo de envio de registros*/
async function create_records_sending_workflow(file_path, file_config){

    /*Se define una variable boleana que permite conocer si el flujo de envio finalizó*/
    let is_workflow_finished = false

    try{

        /*Se define una variable que contiene el DataFrame*/
        let df = dataforge.readFileSync(file_path).parseCSV()
        
        /*Se establece la variable anteriormente definida como la misma,
        aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
        df = df.bake()

        /*Se define una variable que contiene la información de la respuesta de
        la petición especificamente el valor correspondiente al token de acceso*/
        let token_request_response

        /*Se evalua si el método de autenticación a utilizar*/
        if(process.env.AUTH_METHOD.toLowerCase() == 'jwt'){
            
            /*Se define la variable que contiene el JSON Web Token generado y necesario
            para realizar la autenticación ante Adobe Experience Platform API usando JWT*/
            let json_web_token = access_token_generator.generate_json_web_token()
        
            /*Se establece una variable que contiene la respuesta de la petición que se obtiene a partir de la
            función de generación de token de acceso usando JWT, usando el json_web_token como parámetro*/
            token_request_response = await access_token_generator.generate_access_token_using_jwt(json_web_token)
        
        
        }else if(process.env.AUTH_METHOD.toLowerCase() == 'oauth'){
                    
            /*Se establece una variable que contiene la respuesta de la petición que se 
            obtiene a partir de la función de generación de token de acceso usando Oauth*/
            token_request_response = await access_token_generator.generate_access_token_using_oauth()
        
        }

        /*Se evalua si la respuesta de la petición fue exitosa*/
        if(token_request_response.status == 200){

            /*Se define una variable que contiene la información de la respuesta de
            la petición especificamente el valor correspondiente al token de acceso*/
            let access_token = token_request_response.data.access_token

            /*Se realiza una iteración mientras al menos un elemento
            de la columna '_sending_status' sea diferente a 'true'*/
            while(!dataframe.has_dataframe_column_expected_value(df, '_sending_status', 'true')){

                /*Se realiza una iteración por cada fila del DataFrame*/
                for (let row of df.content.values) {

                    /*Se evalua si el valor de '_sending_status' para esta fila es distinto de 'true'*/
                    if(row._sending_status !== 'true'){
                        
                        /*Se define una variable que contenga el valor máximo de la columna '_sending_timestamp' para la identidad definida*/
                        let latest_send_timestamp = dataframe.get_max_column_value_filtered_in_dataframe(df, '_sending_timestamp', file_config.file.identity_column, row[file_config.file.identity_column])

                        /*Se evalua si la variable definida anteriormente es nula*/
                        if(latest_send_timestamp === null){

                            /*Se establece la variable definida anteriormente como cero*/
                            latest_send_timestamp = 0

                        }

                        /*Se evalua si la marca de tiempo actual, en segundos, restado a la variable
                        anteriormente es menor al tiempo de reentrada del perfil en el journey*/
                        if(Math.floor(Date.now()) - latest_send_timestamp > file_config.ajo.reentrance_wait_period * 1000){
                            
                            /*Se define una variable que contiene la fila actual*/
                            let to_send_row = row
                            
                            /*Se evalua si se debe generar una marca de tiempo de envío a Experience Platform*/
                            if(file_config.file.generate_timestamp === true){

                                /*Se establece un campo, _timestamp, en la variable anteriormente
                                definida con la marca de tiempo actual*/
                                to_send_row._timestamp = Math.floor(Date.now())

                            }

                            /*El envío de la petición debe ocurrir en este punto*/
                            let streaming_ingestion_response = await streaming_ingestion.send_record_to_no_xdm_compatible_streaming_endpoint(access_token, file_config.aep.dataflow_id, JSON.stringify(to_send_row, null, 2))

                            /*Se define una variable que contiene la fila enviada*/
                            let sent_row = to_send_row
                                
                            /*Se establece un campo, '_sending_status', en la variable anteriormente
                            definida con un valor 'true'*/
                            sent_row._sending_status = 'true'
                                
                            /*Se establece un campo, '_sending_timestamp', en la variable anteriormente
                            definida con la marca de tiempo actual*/
                            sent_row._sending_timestamp = Math.floor(Date.now())

                            /*Se establece un campo, '_adobe_request_id', en la variable anteriormente
                            definida con el ID de la petición*/
                            sent_row._adobe_request_id = streaming_ingestion_response.headers['x-request-id']

                            /*Se evalua si la respuesta de la petición fue exitosa*/
                            if(streaming_ingestion_response.status == 200){

                                /*Se establece un campo, '_adobe_inlet_id', en la variable anteriormente
                                definida con el ID del endpoint al cual se envia la petición*/
                                sent_row._adobe_inlet_id = streaming_ingestion_response.data.inletId

                                /*Se establece un campo, '_adobe_xaction_id', en la variable anteriormente
                                definida con el ID del registro XDM que se envía en la petición*/
                                sent_row._adobe_xaction_id = streaming_ingestion_response.data.xactionId

                                /*Se establece un campo, '_adobe_flow_id', en la variable anteriormente
                                definida con el ID del flujo de datos al cual se envia la petición*/
                                sent_row._adobe_flow_id = streaming_ingestion_response.data.flowId
                            
                            }

                            /*Se establece la variable anteriormente definida como la misma,
                            reemplazando la fila actual en el DataFrame con la fila enviada*/
                            df = dataframe.replace_row_in_dataframe(df, row, sent_row)

                            /*Se guarda el archivo*/
                            df.asCSV().writeFileSync(file_path)

                        }

                    }

                }

            }

        }

        /*Se establece la variable definida anteriormente como valor true */
        is_workflow_finished = true

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
    }finally{

        /*Se retorna la respuesta a la función original*/
        return is_workflow_finished

    }

}

/*Se definen las funciones a exportar*/
module.exports = {
    create_records_sending_workflow: create_records_sending_workflow
}