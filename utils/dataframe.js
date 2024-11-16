/*Se importa el módulo que permite manipular arreglos*/
const underscore = require('underscore')
/*Se importa el módulo que permite manipular archivos en formato CSV*/
const dataforge = require('data-forge')

/*Se define una función para obtener el valor actual de una columna en un DataFrame*/
function has_dataframe_column_expected_value(df, column_name, expected_column_value){

    /*Se define una variable boleana que permite conocer si la columna tiene el valor esperado*/
    let has_dataframe_column_expected_value = false

    try{

        /*Se evalua si el DataFrame no está vacío*/
        if(df){

            /*Se establece la variable anteriormente definida como la misma,
            aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
            df = df.bake()

            /*Se evalua si el DataFrame tiene, al menos, una línea*/
            if(df.count() > 0 ){

                /*Se evalua si el DataFrame contiene una columna cuyo
                nombre coincida con el nombre de columna definido*/
                if(df.hasSeries(column_name)){

                    if(typeof expected_column_value === 'string' || typeof expected_column_value === 'number' || typeof expected_column_value === 'boolean') {

                        /*Se establece la variable definida anteriormente como la evaluación
                        de que todos los elementos de la columna tengan un valor definido*/
                        has_dataframe_column_expected_value = df.getSeries(column_name).all(record => record === expected_column_value)
                    
                    }

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
        return has_dataframe_column_expected_value
    
    }
}

/*Se define una función para agregar las columnas asociadas al envío de información*/
function add_column_to_dataframe(df, column_name, column_default_value){

    try{

        /*Se evalua si la ruta existe*/
        if(df){

            /*Se establece la variable anteriormente definida como la misma,
            aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
            df = df.bake()

            /*Se evalua si el DataFrame no contiene una columna cuyo
            nombre coincida con el nombre de columna definido*/
            if(!df.hasSeries(column_name)){

                /*Se evalua si el valor por defecto es una cadena de caracteres, número o booleano*/
                if(typeof column_default_value === 'string' || typeof column_default_value === 'number' || typeof column_default_value === 'boolean') {

                    /*Se agrega la columna al archivo, con todos sus valores por defecto definidos*/
                    df = df.withSeries(column_name, new dataforge.Series(Array(df.count()).fill(column_default_value)))
                    
                    /*Se establece la variable anteriormente definida como la misma,
                    aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
                    df = df.bake()
                
                /*Se evalua si el valor por defecto es una función*/
                }else if(typeof column_default_value === 'function'){

                    /*Se agrega la columna al archivo, con todos sus valores por defecto definidos a partir de la función*/
                    df = df.withSeries(column_name, new dataforge.Series(Array(df.count()).fill(null).map(() => {
                        
                        /*Se define una variable nula*/
                        let value = null
                        
                        try{

                            /*Se establece la variable anteriormente definida como el resultado de la función*/
                            value = column_default_value()

                        /*Se realiza una obtención del error ocurrido*/
                        }catch(error){

                            /*Se muestra en consola el error obtenido*/
                            console.log(error)

                            /*Se despliega una excepción asociada al error obtenido*/
                            throw error

                        /*Se ejecuta código independiente de si la ejecución anterior fue exitosa o no*/
                        }finally{

                            /*Se retorna la respuesta a la función original*/
                            return value

                        }
                            
                    })))

                    /*Se establece la variable anteriormente definida como la misma,
                    aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
                    df = df.bake()

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
        return df

    }

}

/*Se define una función para reemplazar una línea de un DataFrame por otra*/
function replace_row_in_dataframe(df, old_row, new_row){

    try{

        /*Se evalua si el DataFrame no está vacío*/
        if(df){

            /*Se establece la variable anteriormente definida como la misma,
            aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
            df = df.bake()

            /*Se evalua si el DataFrame tiene, al menos, una línea*/
            if(df.count() > 0){

                /*Se evalúa si la cantidad de columnas del DataFrame es igual a
                la cantidad de elementos que tiene la línea que va a reemplazar*/
                if(underscore.isEqual(df.getColumnNames().sort(), Object.keys(new_row).sort())){

                    /*Se obtiene el indice de la línea a reemplazar en el DataFrame*/
                    let old_row_index = underscore.findIndex(df.content.values, row => underscore.isEqual(row, old_row))

                    /*Se evalua si el indice de la línea es mayor o igual a cero*/
                    if(old_row_index >= 0){

                        /*Se realiza un reemplazo del valor antiguo por el valor nuevo*/
                        df.content.values[old_row_index] = new_row

                         /*Se establece la variable anteriormente definida como la misma,
                        aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
                        df = df.bake()
                    
                    }

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
        return df

    }
}

/*Se define una función para obtener el ultimo timestamp
asociado al envío de un registro asociado a un perfil*/
function get_max_column_value_filtered_in_dataframe(df, column_name, filter_column_name, filter_value){

    /*Se define una variable que contiene el último timestamp
    asociado al envío de un registro asociado a un perfil*/
    let max_column_value = null

    try{
        
        /*Se evalua si el DataFrame no está vacío*/
        if(df){

            /*Se establece la variable anteriormente definida como la misma,
            aplicando 'lazy evaluation' sobre el conjunto estructurado de datos*/
            df = df.bake()

            /*Se evalua si el DataFrame tiene, al menos, una línea*/
            if(df.count() > 0){

                /*Se evalua si el DataFrame contiene una columna cuyo nombre
                coincida con el valor de la columna de identidad*/
                if(df.hasSeries(filter_column_name) && df.hasSeries(column_name)){
                    
                    /*Se define una variable para guardar el DataFrame filtrado como el DataFrame mismo,
                    buscando los elementos en la columna de identidad que sean igual al valor de identidad*/
                    let filtered_df = df.where(row => row[filter_column_name] === filter_value).bake()

                    /*Se define una variable para guardar la Serie como
                    la obtención de la serie asociada a la columna*/
                    let filtered_column = filtered_df.getSeries(column_name).bake()

                    /*Se establece la variable definida anteriormente como la misma,
                    aplicando un filtro para obtener valores que sean enteros*/
                    filtered_column = filtered_column.filter(value => Number.isInteger(parseInt(value, 10))).bake()

                    /*Se establece la variable definida anteriormente como la misma,
                    aplicando un filtro para omitir valores que sean NaN*/
                    filtered_column =  filtered_column.filter(value => !isNaN(value))

                    /*Se establece la variable definida anteriormente como la
                    misma, aplicando una conversión de los datos a número*/
                    filtered_column = filtered_column.select(value => Number(value)).bake()

                    /*Se evalua si la cantidad de elementos en la Serie es mayor a cero*/
                    if(filtered_column.count() > 0){

                        /*Se establece la variable definida anteriormente
                        como el valor máximo que exista en la serie*/
                        max_column_value = filtered_column.max()
                        
                    }

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
        return max_column_value

    }
}

/*Se definen las funciones a exportar*/
module.exports = {
    has_dataframe_column_expected_value: has_dataframe_column_expected_value,
    add_column_to_dataframe: add_column_to_dataframe,
    replace_row_in_dataframe: replace_row_in_dataframe,
    get_max_column_value_filtered_in_dataframe: get_max_column_value_filtered_in_dataframe
}