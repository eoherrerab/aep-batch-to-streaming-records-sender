/* Se importa el módulo que permite cargar las variables de ambiente*/
import dotenv from 'dotenv';
/* Se importa el módulo que permite limitar la cantidad de ejecuciones de promesas al mismo tiempo*/
import pLimit from 'p-limit';
/*Se importa el módulo que permite la manipulación de rutas y archivos*/
import files from '../utils/files.js'
/*Se importa el módulo que permite manipular archivos en formato CSV*/
import dataforge from 'data-forge'
/*Se importa el módulo que permite cargar archivos en formato CSV*/
import 'data-forge-fs'
/*Se importa el módulo que permite trabajar con DataFrame*/
import dataframe from '../utils/dataframe.js';
/*Se importa el módulo que permite manipular arreglos*/
import underscore from 'underscore'
/*Se importa el módulo que permite trabajar con rutas de archivo*/
import path from 'path'
/*Se importa el módulo que permite generar UUIDs de tipo V4*/
import { v4 as uuidv4 } from 'uuid'
/*Se importa el módulo que permite generar flujos de trabajo*/
import workflows from './workflow/workflow.js';

/*Se establece la configuración del archivo que contiene las variables de ambiente*/
dotenv.config({path: ['config/files.env']})

/*Se define una función principal con un entorno asincrónico*/
async function main(){

    try{

        /*Se define una variable que contiene la cantidad maxima
        de promesas que se pueden ejecutar al mismo tiempo*/
        const limit = pLimit(parseInt(process.env.FILE_EXECUTION_LIMIT))

        /*Se define una variable que contiene la información de los flujos de datos configurados*/
        const files_config = files.get_json_file_content(process.env.FILES_CONFIG_JSON_FILE_PATH)

        /*Se evalua si el archivo contiene información*/
        if(files_config){

            /*Se define una variable que contiene las rutas de los archivos a envíar*/
            let all_files_paths = files.get_all_file_paths(process.env.LOCAL_INPUT_FILES_FOLDER_PATH)

            /*Se establece la variable definida anteriormente como la misma, removiendo
            las rutas de archivos que no tengan extensiones permitidas*/
            all_files_paths = all_files_paths.filter(file_path => files.has_file_allowed_file_format(file_path, process.env.ALLOWED_FILE_EXTENSIONS.split(',')))
            
            /*Se define una variable que contiene las rutas de los archivos que ya han sido totalmente procesados*/
            let sent_files_paths = all_files_paths.filter(file_path => {

                /*Se define una variable que contiene el DataFrame*/
                let df = dataforge.readFileSync(file_path).parseCSV()

                /*Se establece la variable anteriormente definida como la misma,
                aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
                df = df.bake()
                
                /*Se evalua si la columna '_sending_status' tiene todos sus valores en verdadero*/
                if(dataframe.has_dataframe_column_expected_value(df, '_sending_status', 'true')){

                    /*Se retorna true*/
                    return true

                }else{

                    /*Se retorna false*/
                    return false

                }

            })

            /*Se realiza una iteración por cada ruta de archivo que ya ha sido totalmente procesado*/
            for (let sent_file_path of sent_files_paths) {

                /*Se ejecuta la función de cambio de ruta de almacenamiento*/
                await files.move_file_to_folder(sent_file_path, process.env.LOCAL_OUTPUT_FILES_FOLDER_PATH)
            
            }

            /*Se define una variable que contiene las rutas de los archivos que no han sido totalmente procesados*/
            let to_send_files_paths = underscore.difference(all_files_paths, sent_files_paths)

            /*Se evalua si la cantidad de rutas de archivos a procesar es mayor a cero*/
            if(to_send_files_paths.length > 0){

                /*Se establece la variable definida anteriormente como la misma,
                removiendo las rutas que no tengan una configuración asociada*/
                to_send_files_paths = to_send_files_paths.filter(file_path => {

                    /*Se define una variable que contiene el nombre del archivo sin extensión*/
                    let file_name_with_not_ext = path.parse(file_path).name

                    /*Se establece la variable definida anteriormente como la misma,
                    realizando una separación por un caracter definido y tomando el primer elemento*/
                    file_name_with_not_ext = file_name_with_not_ext.split(process.env.FILE_NAME_SEPARATOR)[0]

                    /*Se evalua si existe un flujo de datos configurado relacionado al nombre del archivo*/
                    if(underscore.includes(Object.keys(files_config), file_name_with_not_ext)){

                        /*Se retorna true*/
                        return true

                    }else{

                        /*Se retorna false*/
                        return false

                    }

                })

                /*Se establece la variable definida anteriormente como la misma, agregando la
                columna de _uuid y removiendo las rutas que no tengan la columna agregada*/
                to_send_files_paths = to_send_files_paths.filter(file_path => {

                    /*Se define una variable que contiene el nombre del archivo sin extensión*/
                    let file_name_with_not_ext = path.parse(file_path).name

                    /*Se establece la variable definida anteriormente como la misma,
                    realizando una separación por un caracter definido y tomando el primer elemento*/
                    file_name_with_not_ext = file_name_with_not_ext.split(process.env.FILE_NAME_SEPARATOR)[0]

                    /*Se define una variable que contiene el DataFrame*/
                    let df = dataforge.readFileSync(file_path).parseCSV()

                    /*Se establece la variable anteriormente definida como la misma,
                    aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
                    df = df.bake()

                    /*Se evalua si está activada la opción de generación de uuid*/
                    if(files_config[file_name_with_not_ext].file.generate_uuid === true){

                        /*Se establece la variable definida anteriormente como la misma,
                        agregando la columna '_uuid' con un valor vacío por defecto*/
                        df = dataframe.add_column_to_dataframe(df,'_uuid', uuidv4)

                        /*Se evalua si el DataFrame contiene la columna agregada anteriormente*/
                        if(df.hasSeries('_uuid')){

                            /*Se guarda el archivo*/
                            df.asCSV().writeFileSync(file_path)

                            /*Se retorna true*/
                            return true

                        }else{

                            /*Se retorna true*/
                            return false

                        }

                    }else{

                        /*Se retorna true*/
                        return true


                    }

                })

                /*Se establece la variable definida anteriormente como la misma, agregando la
                columna de _timestamp y removiendo las rutas que no tengan la columna agregada*/
                to_send_files_paths = to_send_files_paths.filter(file_path => {

                    /*Se define una variable que contiene el nombre del archivo sin extensión*/
                    let file_name_with_not_ext = path.parse(file_path).name

                    /*Se establece la variable definida anteriormente como la misma,
                    realizando una separación por un caracter definido y tomando el primer elemento*/
                    file_name_with_not_ext = file_name_with_not_ext.split(process.env.FILE_NAME_SEPARATOR)[0]

                    /*Se define una variable que contiene el DataFrame*/
                    let df = dataforge.readFileSync(file_path).parseCSV()

                    if(files_config[file_name_with_not_ext].file.generate_timestamp === true){

                        /*Se establece la variable definida anteriormente como la misma,
                        agregando la columna '_timestamp' con un valor vacío por defecto*/
                        df = dataframe.add_column_to_dataframe(df,'_timestamp', '')

                        /*Se evalua si el DataFrame contiene la columna agregada anteriormente*/
                        if(df.hasSeries('_timestamp')){

                            /*Se guarda el archivo*/
                            df.asCSV().writeFileSync(file_path)

                            /*Se retorna true*/
                            return true

                        }else{

                            /*Se retorna true*/
                            return false

                        }

                    }else{

                        /*Se retorna true*/
                        return true

                    }

                })

                /*Se establece la variable definida anteriormente como la misma, agregando las columnas
                de metadata del envío y removiendo las rutas que no tengan las columnas agregadas*/
                to_send_files_paths = to_send_files_paths.filter(file_path => {

                    /*Se define una variable que contiene el DataFrame*/
                    let df = dataforge.readFileSync(file_path).parseCSV()

                    /*Se establece la variable definida anteriormente como la misma,
                    agregando la columna '_sending_status' con un valor 'false' por defecto*/
                    df = dataframe.add_column_to_dataframe(df,'_sending_status', 'false')

                    /*Se establece la variable definida anteriormente como la misma,
                    agregando la columna '_sending_timestamp' con un cero por defecto*/
                    df = dataframe.add_column_to_dataframe(df,'_sending_timestamp', 0)

                    /*Se establece la variable definida anteriormente como la misma,
                    agregando la columna '_adobe_request_id' con un cero por defecto*/
                    df = dataframe.add_column_to_dataframe(df,'_adobe_request_id', '')

                    /*Se establece la variable definida anteriormente como la misma,
                    agregando la columna '_adobe_inlet_id' con un cero por defecto*/
                    df = dataframe.add_column_to_dataframe(df,'_adobe_inlet_id', '')

                    /*Se establece la variable definida anteriormente como la misma,
                    agregando la columna '_adobe_xaction_id' con un cero por defecto*/
                    df = dataframe.add_column_to_dataframe(df,'_adobe_xaction_id', '')

                    /*Se establece la variable definida anteriormente como la misma,
                    agregando la columna '_adobe_inlet_id' con un cero por defecto*/
                    df = dataframe.add_column_to_dataframe(df,'_adobe_flow_id', '')

                    /*Se evalua si el DataFrame contiene las columnas agregadas anteriormente*/
                    if(df.hasSeries('_sending_status') && df.hasSeries('_sending_timestamp') && df.hasSeries('_adobe_request_id') && df.hasSeries('_adobe_inlet_id') && df.hasSeries('_adobe_xaction_id') && df.hasSeries('_adobe_flow_id')){

                        /*Se realiza una iteración por cada fila del DataFrame*/
                        df.content.values.forEach(row => {

                            /*Se evalua si el valor '_sending_status' asociado a la fila del
                            DataFrame contiene un estado distinto a 'true' o 'false'*/
                            if(row._sending_status !== 'false' && row._sending_status !== 'true'){

                                /*Se define una variable que contiene la información de la fila*/
                                let new_row = row

                                /*Se establece un estado por defecto para la fila*/
                                new_row._sending_status = 'false'

                                /*Se establece la variable definida anteriormente como la misma,
                                pero reemplazando la fila anterior con la nueva que incluye el
                                estado por defecto para '_sending_status'*/
                                df = dataframe.replace_row_in_dataframe(df, row, new_row)

                            }

                        })

                        /*Se guarda el archivo*/
                        df.asCSV().writeFileSync(file_path)

                        /*Se retorna true*/
                        return true

                    }else{

                        /*Se retorna false*/
                        return false

                    }

                })

                /*Se ejecuta la función asincrónica de ejecución de envió*/
                await Promise.allSettled(to_send_files_paths.map((file_path) => limit(() => {

                    /*Se define una variable que contiene el nombre del archivo sin extensión*/
                    let file_name_with_not_ext = path.parse(file_path).name;
                    
                    /*Se establece la variable definida anteriormente como la misma,
                    realizando una separación por un caracter definido y tomando el primer elemento*/
                    file_name_with_not_ext = file_name_with_not_ext.split(process.env.FILE_NAME_SEPARATOR)[0];
                    
                    /*Se ejecuta la función de creación de flujo de envío de registros*/
                    workflows.create_records_sending_workflow(file_path, files_config[file_name_with_not_ext]);
                
                })));

                /*Se ejecuta un tiempo de espera de 5 segundos*/
                await files.create_sync_waiting_time(5)

                /*Se define una variable que contiene las rutas de los archivos que ya han sido totalmente procesados*/
                sent_files_paths = to_send_files_paths.filter(file_path => {

                    /*Se define una variable que contiene el DataFrame*/
                    let df = dataforge.readFileSync(file_path).parseCSV()
    
                    /*Se establece la variable anteriormente definida como la misma,
                    aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
                    df = df.bake()
                    
                    /*Se evalua si la columna '_sending_status' tiene todos sus valores en verdadero*/
                    if(dataframe.has_dataframe_column_expected_value(df, '_sending_status', 'true')){
    
                        /*Se retorna true*/
                        return true
    
                    }else{
    
                        /*Se retorna false*/
                        return false
    
                    }
    
                })

                /*Se realiza una iteración por cada ruta de archivo que ya ha sido totalmente procesado*/
                for (let sent_file_path of sent_files_paths) {

                    /*Se ejecuta la función de cambio de ruta de almacenamiento*/
                    files.move_file_to_folder(sent_file_path, process.env.LOCAL_OUTPUT_FILES_FOLDER_PATH)

                }

            }

        }

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

    }

}

main()
