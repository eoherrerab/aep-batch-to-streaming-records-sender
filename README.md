# AEP Batch to Streaming Records Sender

AEP Batch to Streaming Records Sender es un script que permite la conversión de un conjunto de archivos de texto plano, CSV, a registros individuales que se envían mediante HTTP a Adobe Experience Platform

## Caracteristicas

-  **Activación de varios flujos de datos a la vez:** como lo especifica la documentación, un flujo de datos es una representación independiente y aislada de un flujo de trabajo que permite la ingesta y manipulación de datos a través de Adobe Experience Platform. Este script utiliza los servicios proporcionados por Streaming Ingestion API para ingestar la información proveniente de los archivos de texto plano sin seguir el estandar XDM.

- **Generación de UUID y marcas de tiempo:** la documentación menciona que existen campos asociados a las clases de esquemas por defecto en Adobe Experience Platform, tales como timestamp o _id en la clase de XDM ExperienceEvent, que son necesarios a causa de la necesidad de establecer valores que permitan realizar trazabilidad a los registros. Este script permite generar una marca de tiempo, en un campo llamado _timestamp, y un UUID, llamado _uuid, para cada registro que se envie a Experinece Platform si es necesario.

- **Persistencia de registros y estado de envio:** Este script modifica los archivos de texto plano, agregando columnas que contienen metadatos asociados al envío, como una marca de tiempo de envío y el estado del envío mismo, así como la información obtenida desde Streaming Ingestion API en la respuesta por cada petición.

## Requerimientos

- **NodeJS:** Este permite ejecutar el script. Particularmente estoy utilizando la versión v20.11.0, sin embargo esto no implica directamente que no pueda funcionar en otras versiones.

## Configuración

Una vez posea los archivos del repositorio en su entorno local, se accede a la carpeta *config* del mismo y, dependiendo del método de autenticación a utilizar, se debe cambiar el nombre del archivo correspondiente a *aep.env*. Actualmente se manejan los métodos de autenticación dispuestos por Adobe, JWT y Oauth, relacionados a los archivos *aep_jwt.env* y *aep_oauth.env* respectivamente, ubicados en la carpeta *config*.

A partir del archivo que se haya renombrado como *aep.env*, se debe de ingresar las credenciales en dicho archivo. A continuación se describe la información de cada campo en ambos archivos:

### Campos para archivo .env de autenticación por estandar Oauth

|Nombre de variable de ambiente|Descripción|Donde obtener este valor|
|--|--|--|
|AUTH_METHOD|Es un valor que identifica el método de autenticación a utilizar. Este valor, para método de autenticación por Oauth, es *OAUTH*|Predefinido por el archivo de ambiente|
|CLIENT_SECRET|Es un valor formado, normalmente, por letras, en mayúsculas y minúsculas, y números, en conjuntos de caracteres separados por guiones. Este valor, en conjunto con API KEY, permite la creación de tokens de acceso|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|API_KEY|Es un valor formado, normalmente, por letras, en minúscula, y números. Este valor, en conjunto con CLIENT SECRET, permite la creación de tokens de acceso|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|IMS_ORG|Es un valor formado, normalmente, por letras, en mayúscula, números y con sufijo *@AdobeOrg*. Este valor identifica la propiedad/organización en Adobe|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|GRANT_TYPE|Es un valor que indica que tipo de acceso relacionado al token a generar. Este valor, por defecto, es *client_credentials*|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|SCOPES|Es un valor que indica el alcance relacionado al token a generar. Este valor, por defecto, es *openid, session, cjm.suppression_service.client.delete, AdobeID, read_organizations, cjm.suppression_service.client.all, additional_info.projectedProductContext*|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|SANDBOX_NAME|Nombre distintivo del ambiente sobre cual se realizan las consultas. Por defecto, al contratar Adobe Experience Platform, se crea un ambiente productivo con nombre distintivo *prod*|Se obtiene mediante la opción de Sandboxes, dentro de la categoría Administration del menú de Adobe Experience Platform|
|XDM_NO_COMPATIBLE_STREAMING_ENDPOINT|Es un valor formado, normalmente, por letras, en minúscula, números y con prefijo *https://dcs.adobedc.net/collection/*. Este valor corresponde al enlace correspondiente a la API a la cual se deben envíar las peticiones POST|Se obtiene accediendo a la cuenta de conexión de fuente HTTP creada anteriormente, seleccionando el campo de *Streaming endpoint*, dentro de la categoría Connections del menú en Adobe Experience Platform|

### Campos para archivo .env de autenticación por estandar JWT
|Nombre de variable de ambiente|Descripción|Donde obtener este valor|
|--|--|--|
|AUTH_METHOD|Es un valor que identifica el método de autenticación a utilizar. Este valor, para método de autenticación por JWT, es *JWT*|Predefinido por el archivo de ambiente|
|CLIENT_SECRET|Es un valor formado, normalmente, por letras, en mayúsculas y minúsculas, y números, en conjuntos de caracteres separados por guiones. Este valor, en conjunto con API KEY, permite la creación de tokens de acceso|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|API_KEY|Es un valor formado, normalmente, por letras, en minúscula, y números. Este valor, en conjunto con CLIENT SECRET, permite la creación de tokens de acceso|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|IMS_ORG|Es un valor formado, normalmente, por letras, en mayúscula, números y con sufijo *@AdobeOrg*. Este valor identifica la propiedad/organización en Adobe|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|METASCOPES|Es un valor que indica el alcance relacionado con el token a generar. Este valor, por defecto, es *ent_dataservices_sdk*|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|TECHNICAL_ACCOUNT_ID|Es un valor formado, normalmente, por letras, en mayúscula, números y con sufijo *@techacct.adobe.com*. Este valor identifica la propiedad/organización en Adobe desde Developer Console|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|PRIVATE_KEY|Es un valor formado, normalmente, por letras, en mayúsculas y minúsculas, números, caracteres especiales, tiene como prefijo *-----BEGIN PRIVATE KEY-----* y como sufijo *-----END PRIVATE KEY-----*|Se obtiene al crear un proyecto en Adobe Developer Console y agregando la Experience Platform API|
|SANDBOX_NAME|Nombre distintivo del ambiente sobre cual se realizan las consultas. Por defecto, al contratar Adobe Experience Platform, se crea un ambiente productivo con nombre distintivo *prod*|Se obtiene mediante la opción de Sandboxes, dentro de la categoría Administration del menú de Adobe Experience Platform|
|XDM_NO_COMPATIBLE_STREAMING_ENDPOINT|Es un valor formado, normalmente, por letras, en minúscula, números y con prefijo *https://dcs.adobedc.net/collection/*. Este valor corresponde al enlace correspondiente a la API a la cual se deben envíar las peticiones POST|Se obtiene accediendo a la cuenta de conexión de fuente HTTP creada anteriormente, seleccionando el campo de *Streaming endpoint*, dentro de la categoría Connections del menú en Adobe Experience Platform|

Posteriormente, se accede al archivo *files.env* y se debe de ingresar las configuraciones requeridas en dicho archivo. A continuación se describe la información de cada campo en el archivo:

### Campos para archivo .env de configuración de rutas de archivos

|Nombre de variable de ambiente|Descripción|Donde obtener este valor|
|--|--|--|
|LOCAL_INPUT_FILES_FOLDER_PATH|Ruta de la carpeta donde se encuentran los archivos de texto plano, CSV, con los registros a envíar. Este valor, por defecto, es *logs/input*|Predefinido por el archivo de ambiente, con posibilidad de cambiar dicho valor dependiendo de la necesidad del usuario|
|LOCAL_OUTPUT_FILES_FOLDER_PATH|Ruta de la carpeta donde se encuentran los archivos de texto plano, CSV, con los registros ya enviados. Este valor, por defecto, es *logs/output*. Al ejecutar el script, si esta ruta no existe, se creará dentro de la ruta del repositorio|Predefinido por el archivo de ambiente, con posibilidad de cambiar dicho valor dependiendo de la necesidad del usuario|
|FILES_CONFIG_JSON_FILE_PATH|Ruta donde se encuentra el archivo JSON con los flujos de datos configurados. Este valor, por defecto, es *config/files_config.json*|Predefinido por el archivo de ambiente, con posibilidad de cambiar dicho valor dependiendo de la necesidad del usuario|
|ALLOWED_FILE_EXTENSIONS|Extensiones permitidas de los archivos de texto plano, CSV, con los registros a envíar. Cada uno de estas extensiones de archivos debe ir separada del resto usando el caracter de coma. Este valor, por defecto, es *csv*|Predefinido por el archivo de ambiente, definido en base a las limitaciones de DataForge, módulo de lectura y transformación de información utilizado en el script|
|FILE_NAME_SEPARATOR|Caracter especial que funciona como separador utilizado en los archivos de texto plano, CSV, con los registros a envíar. El primer valor obtenido en base al nombre, dividido a partir del separador configurado, es el utilizado como *FILEKEYWORD* en el archivo *config/files_config.json*. Este valor, por defecto, es *_*|Predefinido por el archivo de ambiente, con posibilidad de cambiar dicho valor dependiendo de la necesidad del usuario|
|FILE_EXECUTION_LIMIT|Cantidad de archivos de texto plano, CSV, que se pueden manipular al mismo tiempo. Este valor, por defecto, es *5*|Predefinido por el archivo de ambiente, con posibilidad de cambiar dicho valor dependiendo de la necesidad del usuario|

### Campos para archivo .JSON de configuración de flujos en Experience Platform y Journey Optimizer

Finalmente, se accede al archivo *files_config.json* y se debe de ingresar las configuraciones requeridas en dicho archivo. Primeramente, se muestra un archivo *files_config.json* de ejemplo:

```json
{
    "FILEKEYWORD":{
        "aep":{
            "dataflow_id":"DATAFLOW_ID_FROM_EXPERIENCE_PLATFORM"
        },
        "ajo":{
            "reentrance_wait_period": 60
        },
        "file":{
            "identity_column":"COLUMN_NAME_IN_FILE_CONTAINING_PRIMARY_IDENTITY",
            "generate_uuid": true,
            "generate_timestamp": true
        }
    }
},
{
    ...
}
```

A continuación se describe la información de cada campo en el archivo:

|Nombre de variable de ambiente|Descripción|Donde obtener este valor|
|--|--|--|
|<\<FILEKEYWORD\>>|Palabra clave asociada al archivo de texto plano, CSV, con los registros a envíar, que a su vez está asociada a un flujo de datos configurado en Adobe Experience Platform|Se obtiene a partir del archivo de texto plano, CSV, que se desee configurar|
|<\<FILEKEYWORD\>>.aep.dataflow_id|Es un valor formado, normalmente, por letras, en minúsculas, y números, en conjuntos de caracteres separados por guiones|Se obtiene accediendo al flujo de datos desde la cuenta de conexión de fuente HTTP creada anteriormente, seleccionando el campo de *Dataflow ID*, dentro de la categoría Connections del menú en Adobe Experience Platform|
|<\<FILEKEYWORD\>>.ajo.reentrance_wait_period|Es un valor numérico, dado en segundos, que define la cantidad de tiempo a esperar antes de enviar la siguiente petición asociada al perfil|Predefinido por el archivo de ambiente, sujeto a cambios realizados por el usuario dependiendo del caso de uso y de la configuración en journeys desplegados en Adobe Journey Optimizer|
|<\<FILEKEYWORD\>>.file.identity_column|Es un valor de tipo cadena de caracteres que define el nombre de la columna que contiene la identidad del perfil|Se obtiene a partir del archivo de texto plano, CSV, que se desee configurar|
|<\<FILEKEYWORD\>>.file.generate_uuid|Es un valor de tipo booleano que define si se debe generar un UUID para cada registro.<br><br>**NOTA:** Si el archivo de texto plano, CSV, no contiene UUID para cada registro, se recomienda ampliamente generar UUID unicos del lado del *script* mediante esta opción y, en medida de lo posible, evitar usar *uuid()* o *guid()* al momento de usar las Mapping Functions sobre el flujo de datos XDM no compatible, con la finalidad de mitigar la reingesta de registros basados en la arquitectura *at-least-once* de Adobe Experience Platform|Se define a partir del contenido del archivo de texto plano, CSV, que se desee configurar|
|<\<FILEKEYWORD\>>.file.generate_timestamp|Es un valor de tipo booleano que define si se debe generar una marca de tiempo para cada registro|Se define a partir del contenido del archivo de texto plano, CSV, que se desee configurar|

## Columnas agregadas en archivos CSV

Al iniciar un procesamiento de archivos para la carga de registros a Adobe Experience Platform, se agregan ciertas columnas que incluyen metadatos correspondientes a cada petición que se realiza. Adicionalmente, dependiendo de las configuraciones realizadas en el archivo *files_config.json*, se agregan columnas correspondientes a la marca de tiempo y al UUID generado para cada registro antes de enviarse.

A continuación se describe la información de cada columna:

|Nombre de columna|Descripción|Razón por la cual se genera la columna|
|--|--|--|
|_uuid|Columna que contiene un identificador único universal (UUID) para cada fila del archivo. A nivel de Adobe Experience Plaform, un UUID, permite identificar un registro único a través de todo el ecosistema de Adobe Experience Cloud. Particularmente en caso de registros almacenados en conjuntos de datos basados en esquemas ExperienceEvent, este valor es obligatorio|El valor <\<FILEKEYWORD\>>.file.generate_uuid, en el archivo *files_config.json*, es *true*|
|_timestamp|Columna que contiene la marca de tiempo del momento en que se realiza el envío de la petición. Particularmente en caso de registros almacenados en conjuntos de datos basados en esquemas ExperienceEvent, este valor es obligatorio|El valor <\<FILEKEYWORD\>>.file.generate_timestamp, en el archivo *files_config.json*, es *true*|
|_sending_status|Columna que contiene el estado de envío del registro|Autogenerado para control de envíos|
|_sending_timestamp|Columna que contiene la marca de tiempo del momento en que se confirma el envío de la petición|Autogenerado para control de envíos|
|_adobe_request_id|Columna que contiene el ID de la petición una vez es respondida por el servicio de Streaming Ingestion API, independientemente del estado de la petición misma|Autogenerado para *troubleshooting* relacionado a Adobe Experience Platform|
|_adobe_inlet_id|Columna que contiene el ID del *endpoint* de Streaming Ingestion API al cual se realiza la petición|Autogenerado para *troubleshooting* relacionado a Adobe Experience Platform|
|_adobe_xaction_id|Columna que contiene el ID de la acción individual una vez es respondida por el servicio de Streaming Ingestion API|Autogenerado para *troubleshooting* relacionado a Adobe Experience Platform|
|_adobe_flow_id|Columna que contiene el ID del flujo de datos al cual se realiza la petición|Autogenerado para *troubleshooting* relacionado a Adobe Experience Platform|

## Limitantes
 
- Todos los flujos de datos deben pertenecer a la misma cuenta de conexión de fuente HTTP API. Esto es debido a que el valor de *XDM_NO_COMPATIBLE_STREAMING_ENDPOINT* es cargado de manera global desde del archivo *aep.env*.

- La cuenta de conexión de fuente HTTP API, y en consecuencia sus flujos de datos, deben ser XDM no compatibles. Esto es debido a que los registros que se envían al *Streaming endpoint* en la cuenta de conexión de fuente HTTP API no siguen el estandar XDM de Adobe Experience Platform y, por tanto, para que estos sean aceptados, se debe de realizar con anterioridad un *mapping* usando un archivo de muestra.

## Casos de uso

- **Conversión de archivos en lotes a eventos individuales:** como indica la documentación, los eventos que se ingestan mediante lotes no pueden activar journeys que sean disparados por eventos, dado que dichos eventos deben ser enviados a través del *Data Collection Core Service (DCCS)*. Este script permite la conversión de un conjunto de archivos de texto plano, CSV, a registros individuales que se envían mediante HTTP API a Adobe Experience Platform, implicando que dichos eventos serían enviados a través del *Data Collection Core Service*, permitiendo la activación de journeys.