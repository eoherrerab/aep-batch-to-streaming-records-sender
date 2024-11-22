/*Se importa el módulo que permite manipular el sistema de archivos*/
const fs = require('fs')
/*Se importa el módulo que permite manipular las rutas de archivos*/
const path = require('path')
/*Se importa el módulo que permite manipular arreglos*/
const underscore = require('underscore')

/*Se define una función para cargar el archivo JSON*/
function get_json_file_content(file_path){

    /*Se define una variable que contiene, valga la
    redundancia, el contenido del archivo JSON*/
    let json_file = null

    try{

        /*Se evalua si la ruta existe*/
        if(fs.existsSync(file_path)){

            /*Se define una variable que contiene la
            información asociada a la ruta del archivo*/
            let stats = fs.lstatSync(file_path)

            /*Se evalua si la ruta está asociada a un archivo*/
            if(stats.isFile()){

                /*Se define una variable que contiene, valga la
                redundancia, el contenido del archivo JSON en bruto*/
                let data = fs.readFileSync(file_path)

                /*Se establece la variable definida anteriormente como el contenido
                del archivo JSON  en bruto, convertido a objeto de Javascript*/
                json_file = JSON.parse(data)

            }

        }

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
    }finally{

        /*Se retorna la respuesta a la función original*/
        return json_file

    }

}

/*Se define una función para obtener las rutas de los archivos,
incluidos los que se encuentran en las subrutas*/
function get_all_file_paths(main_file_path){

    /*Se define una variable que contiene las rutas de archivos*/
    let full_file_paths = []

    try{

        /*Se evalua si la ruta existe*/
        if(fs.existsSync(main_file_path)){

            /*Se define una variable que contiene la
            información asociada a la ruta del archivo*/
            let main_stats = fs.lstatSync(main_file_path)

            /*Se evalua si la ruta está asociada a un archivo*/
            if(main_stats.isDirectory()){

                /*Se define una variable que contiene las rutas superficiales*/
                let file_paths = fs.readdirSync(main_file_path)

                /*Se realiza una iteración sobre cada ruta superficial detectada*/
                file_paths.forEach(function(file_path){
                    
                    /*Se define una variable que contiene la ruta concatenada del archivo*/
                    let full_file_path = path.join(main_file_path, file_path)

                    /*Se define una variable que contiene la información
                    asociada a la ruta concatenada del archivo*/
                    let stats = fs.lstatSync(full_file_path)

                    /*Se evalua si la ruta concatenada está asociada a un archivo*/
                    if(stats.isFile()){

                        /*Si la ruta concatenada está asociada a un archivo,
                        se agrega la ruta a la lista de rutas de archivos*/
                        full_file_paths.push(full_file_path)

                    /*Se evalua si la ruta concatenada está asociada a un directorio*/
                    }else if(stats.isDirectory()){

                        /*Si la ruta concatenada está asociada a un directorio, se concatena la lista actual
                        con la lista obtenida mediante recursividad en el uso de la función misma */
                        full_file_paths = full_file_paths.concat(get_all_file_paths(full_file_path))

                    }

                })

            }

        }

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
    }finally{

        /*Se retorna la respuesta a la función original*/
        return full_file_paths

    }

}

/*Se define una función para conocer si un archivo está
en una extensión permitida por la configuración*/
function has_file_allowed_file_format(file_path, allowed_file_extensions){

    /*Se define una variable boleana que permite conocer si
    un archivo está en una extensión permitida*/
    let is_file_allowed_file_format = false

    try{

        /*Se evalua si la ruta existe*/
        if(fs.existsSync(file_path)){

            /*Se evalua si las extensiones de archivo permitidas vienen en formato de arreglo*/
            if(Array.isArray(allowed_file_extensions)){

                /*Se establece la variable definida anteriormente como la misma,
                removiendo los espacios al inicio y al final de cada elemento de la lista*/
                allowed_file_extensions = allowed_file_extensions.map(allowed_file_extension => allowed_file_extension.trim())

                /*Se establece la variable definida anteriormente como la misma, removiendo los elementos que sean vacíos*/
                allowed_file_extensions = allowed_file_extensions.filter(allowed_file_extension => allowed_file_extension != "")

                /*Se establece la variable definida anteriormente como la misma, agregando el carácter
                de punto al inicio de cada elemento de la lista en caso de que este no lo posea*/
                allowed_file_extensions = allowed_file_extensions.map(allowed_file_extension => {

                    /*Se evalua si el elemento de la lista no comienza con un punto*/
                    if(!allowed_file_extension.startsWith('.')){

                        /*Si el elemento de la lista no comienza con
                        un punto, se agrega el carácter en cuestión*/
                        return "." + allowed_file_extension
                    
                    }else{

                        /*Si el elemento de la lista comiena con un
                        punto, mantiene la extensión sin modificar*/
                        return allowed_file_extension

                    }
                })

                /*Se establece la variable definida anteriormente como la
                misma, convirtiendo cada elemento de la misma a minúsculas*/
                allowed_file_extensions = allowed_file_extensions.map(allowed_file_extension => allowed_file_extension.toLowerCase())

                /*Se establece la variable definida anteriormente
                como la misma, removiendo los elementos repetidos*/
                allowed_file_extensions = underscore.uniq(allowed_file_extensions)

                /*Se define una variable que contiene la extensión del archivo correspondiente*/
                let current_file_extension = path.extname(file_path).toLowerCase()

                /*Se evalua si la lista de extensiones permitidas contiene la extensión del archivo*/
                if(allowed_file_extensions.includes(current_file_extension)){

                    /*Si la lista de extensiones permitidas contiene la extensión del archivo,
                    se establece la variable definida anteriormente como verdadero*/
                    is_file_allowed_file_format = true

                }

            }

        }

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
    }finally{

        /*Se retorna la respuesta a la función original*/
        return is_file_allowed_file_format

    }
}

/*Se define una función para mover archivos a una ruta definida*/
async function move_file_to_folder(absolute_source_file_path, absolute_source_folder_path, absolute_destination_folder_path){

    /*Se define una variable boleana que permite conocer si finalizó el cambio de ruta, inicializada en false*/
    let is_file_moved = false

    try{

        /*Se establece la variable definida anteriormente como la ruta
        absoluta de fuente de almacenamiento del archivo a mover*/
        absolute_source_file_path = path.resolve(absolute_source_file_path)

        /*Se establece la variable definida anteriormente como la ruta
        absoluta de fuente de almacenamiento de los archivos*/
        absolute_source_folder_path = path.resolve(absolute_source_folder_path)

        /*Se establece la variable definida anteriormente como la ruta
        absoluta de destino de almacenamiento de los archivos*/
        absolute_destination_folder_path = path.resolve(absolute_destination_folder_path)

        /*Se define una variable que contiene la ruta relativa
        fuente de almacenamiento de los archivos*/
        let relative_source_file_path = path.relative(absolute_source_folder_path, absolute_source_file_path)

        /*Se define una variable que contiene la ruta absoluta
        final de destino de almacenamiento de los archivos*/
        let final_absolute_destination_folder_path = path.join(absolute_destination_folder_path, path.dirname(relative_source_file_path))

        /*Se define una variable que contiene la ruta absoluta
        final de destino de almacenamiento del archivo a mover*/
        let final_absolute_destination_file_path = path.join(absolute_destination_folder_path, relative_source_file_path)

        /*Se evalua si la ruta destino de almacenamiento del archivo no existe*/
        if (!fs.existsSync(final_absolute_destination_folder_path)) {
    
            /*Si la ruta destino de almacenamiento no existe, se genera la ruta*/
            fs.mkdirSync(final_absolute_destination_folder_path, { recursive: true })
                    
        }

        /*Se cambia la ruta de almacenamiento del archivo actual por la nueva ruta de almacenamiento*/
        fs.renameSync(absolute_source_file_path, final_absolute_destination_file_path)

        /*Se establece la variable definida anteriormente como valor true */
        is_file_moved = true

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
    }finally{

        /*Se retorna la respuesta a la función original*/
        return is_file_moved

    }

}

/*Se define una función para ejecutar un tiempo de espera de manera sincrónica*/
async function create_sync_waiting_time(waiting_time) {
    
    /*Se define una variable boleana que permite conocer si la espera de tiempo se cumplió, inicializada en false*/
    let is_waiting_time_done = false

    try{
        
        /*Se evalua si el valor es un entero*/
        if(Number.isInteger(parseInt(waiting_time, 10))){

            /*Se evalua si el valor es un NaN*/
            if(!isNaN(waiting_time)){

                /*Se ejecuta una nueva promesa con un tiempo límite dado por el valor*/
                await new Promise(resolve => setTimeout(resolve, Number(waiting_time) * 1000))

                /*Se establece la variable definida anteriormente como valor true */
                is_waiting_time_done = true

            }

        }

    /*Se realiza una obtención del error ocurrido*/
    }catch(error){

        /*Se muestra en consola el error obtenido*/
        console.log(error)

        /*Se despliega una excepción asociada al error obtenido*/
        throw error

    /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
    }finally{

        /*Se retorna la respuesta a la función original*/
        return is_waiting_time_done

    }

}

/*Se definen las funciones a exportar*/
module.exports = {
    get_json_file_content: get_json_file_content,
    get_all_file_paths: get_all_file_paths,
    has_file_allowed_file_format: has_file_allowed_file_format,
    move_file_to_folder: move_file_to_folder,
    create_sync_waiting_time: create_sync_waiting_time 
}