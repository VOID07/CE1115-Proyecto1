# CE1115-Proyecto1
Aplicación a utilizar para pruebas de seguridad.

## Prerrequisitos:
Es necesario contar con una solución que permita administrar contenedores, ya sea Docker o Podman.Podman.
Además, es necesario instalar la versión compose de ambas herramientas para poder ejecutar ambos contenedores de manera simultánea.

En esta documentación se va a utilizar Podman, pero es intercambiable con Docker. Además, se utiliza Brew como administrador de paquetes.

1. Instalar [Brew](https://brew.sh)

``` sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Instalar podman y podman-compose
```
brew install podman podman-compose
```

3. Instalar Podman Desktop (opcional): https://podman-desktop.io/

4. Crear VM de Podman (se indica que no existe al ejecutar los siguientes comandos)

5. Construir la imagen de GraphQL y construir la imagen de Podman Compose.
```
podman build ./src/app && \
podman compose build
```

6. Ejecutar los contenedores utilizando Podman Compose
```
podman compose up -d
```

7. Verificar el estado de los contenedores, en caso de haber errores con `podman logs <container_name>`

8. La aplicación debería estar disponible en `http://localhost:4000/graphiql`

9. Para detener los contenedores, es posible realizarlo desde Podman Desktop, o utilizando el comando
```
podman compose down
```

### Requisitos adicionales
Para ejecutar correctamente los contenedores, es necesario crear un archivo `.env` en la raíz del proyecto con los siguientes valores:
``` sh
POSTGRES_USER=<custom_user>
POSTGRES_PASSWORD=<custom_password>
POSTGRES_DB=<custom_db_name>
```